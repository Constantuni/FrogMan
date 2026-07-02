using FrogMan.Domain.Constants;
using FrogMan.Domain.Entities;
using FrogMan.Application.DTOs.Workspaces;
using FrogMan.Application.Interfaces.Repositories;
using FrogMan.Application.Interfaces.Services;

namespace FrogMan.Application.Services;

public class WorkspaceService(
    IWorkspaceRepository workspaceRepository, 
    IUserRepository userRepository,
    IUnitOfWork unitOfWork) : IWorkspaceService
{
    public async Task<WorkspaceResponse> CreateWorkspaceAsync(
        Guid userId, 
        CreateWorkspaceRequest request, 
        CancellationToken cancellationToken)
    {
        var workspace = new Workspace
        {
            Name = request.Name.Trim(),
            OwnerUserId = userId
        };

        await workspaceRepository.AddAsync(workspace, cancellationToken);

        var ownerMembership = new WorkspaceMember
        {
            WorkspaceId = workspace.Id,
            UserId = userId,
            Role = WorkspaceRoles.Owner
        };

        await workspaceRepository.AddMemberAsync(ownerMembership, cancellationToken);
        
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToResponse(workspace);
    }

    public async Task<List<WorkspaceResponse>> GetMyWorkspacesAsync(
        Guid userId, 
        CancellationToken cancellationToken)
    {
        var workspaces = await workspaceRepository.GetWorkspacesByUserIdAsync(userId, cancellationToken);

        return workspaces.Select(MapToResponse).ToList();
    }

    public async Task<WorkspaceResponse?> GetWorkspaceByIdAsync(
        Guid id, 
        Guid userId, 
        CancellationToken cancellationToken)
    {
        var workspace = await workspaceRepository.GetByIdWithMembersAsync(id, cancellationToken);

        if (workspace is null || !workspace.Members.Any(m => m.UserId == userId))
            return null;

        return MapToResponse(workspace);
    }

    public async Task<WorkspaceResult> UpdateWorkspaceAsync(
        Guid id, 
        Guid userId, 
        UpdateWorkspaceRequest request, 
        CancellationToken cancellationToken)
    {
        var workspace = await workspaceRepository.GetByIdWithMembersAsync(id, cancellationToken);

        if (workspace is null)
            return WorkspaceResult.NotFound();

        var isMember = workspace.Members.Any(m => m.UserId == userId);
        if (!isMember)
            return WorkspaceResult.NotFound();

        if (workspace.OwnerUserId != userId)
            return WorkspaceResult.Forbidden();

        workspace.Name = request.Name.Trim();
        
        workspaceRepository.Update(workspace);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return WorkspaceResult.Success(MapToResponse(workspace));
    }

    public async Task<WorkspaceResult> DeleteWorkspaceAsync(
        Guid id, 
        Guid userId, 
        CancellationToken cancellationToken)
    {
        var workspace = await workspaceRepository.GetByIdWithMembersAsync(id, cancellationToken);

        if (workspace is null)
            return WorkspaceResult.NotFound();

        var isMember = workspace.Members.Any(m => m.UserId == userId);
        if (!isMember)
            return WorkspaceResult.NotFound();

        if (workspace.OwnerUserId != userId)
            return WorkspaceResult.Forbidden();

        workspaceRepository.Delete(workspace);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return WorkspaceResult.Success();
    }

    public async Task<List<WorkspaceMemberResponse>?> GetWorkspaceMembersAsync(
    Guid workspaceId, 
    Guid userId, 
    CancellationToken cancellationToken)
{
    var workspace = await workspaceRepository.GetByIdWithMembersAsync(workspaceId, cancellationToken);

    if (workspace is null || !workspace.Members.Any(m => m.UserId == userId))
        return null;

    return workspace.Members.Select(m => new WorkspaceMemberResponse
    {
        UserId = m.UserId,
        Name = m.User?.Username ?? "Unknown User",
        Email = m.User?.Email ?? string.Empty,
        Role = m.Role,
        JoinedAt = m.JoinedAt
    }).ToList();
}

    private static WorkspaceResponse MapToResponse(Workspace workspace)
    {
        return new WorkspaceResponse
        {
            Id = workspace.Id,
            Name = workspace.Name,
            OwnerUserId = workspace.OwnerUserId,
            CreatedAt = workspace.CreatedAt
        };
    }

    public async Task<WorkspaceResult> AddMemberByEmailAsync(
        Guid workspaceId, 
        Guid ownerId, 
        AddMemberRequest request, 
        CancellationToken cancellationToken)
    {
        // 1. Fetch workspace context with its active join collection
        var workspace = await workspaceRepository.GetByIdWithMembersAsync(workspaceId, cancellationToken);
        if (workspace is null) 
            return WorkspaceResult.NotFound();

        // 2. Multitenant authorization guard: verify only the owner can invite others
        if (workspace.OwnerUserId != ownerId) 
            return WorkspaceResult.Forbidden();

        // 3. Find target user by the requested email address
        var targetUser = await userRepository.GetByEmailAsync(request.Email.Trim(), cancellationToken);
        if (targetUser is null)
        {
            return WorkspaceResult.Failure("User with this email address does not exist.");
        }

        // 4. Validate that they aren't already grouped into this tenant workspace
        var isAlreadyMember = workspace.Members.Any(m => m.UserId == targetUser.Id);
        if (isAlreadyMember)
        {
            return WorkspaceResult.Failure("User is already a member of this workspace.");
        }

        // 5. Append new cross-link tracking record to the database
        var newMembership = new WorkspaceMember
        {
            WorkspaceId = workspaceId,
            UserId = targetUser.Id,
            Role = request.Role.Trim()
        };

        await workspaceRepository.AddMemberAsync(newMembership, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return WorkspaceResult.Success();
    }
}