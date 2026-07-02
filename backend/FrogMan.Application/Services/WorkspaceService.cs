using FrogMan.Domain.Constants;
using FrogMan.Domain.Entities;
using FrogMan.Application.DTOs.Workspaces;
using FrogMan.Application.DTOs.WorkspaceMembers;
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

        var currentMember = workspace.Members.FirstOrDefault(m => m.UserId == userId);
        if (currentMember is null)
            return WorkspaceResult.NotFound();

        // STRICT GUARD: Admins and Members cannot edit workspaces. Only Owners.
        if (currentMember.Role != WorkspaceRoles.Owner)
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

        var currentMember = workspace.Members.FirstOrDefault(m => m.UserId == userId);
        if (currentMember is null)
            return WorkspaceResult.NotFound();

        // STRICT GUARD: Admins and Members cannot delete workspaces. Only Owners.
        if (currentMember.Role != WorkspaceRoles.Owner)
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
        Guid userId,
        AddMemberRequest request, 
        CancellationToken cancellationToken)
    {
        var workspace = await workspaceRepository.GetByIdWithMembersAsync(workspaceId, cancellationToken);
        if (workspace is null) 
            return WorkspaceResult.NotFound();

        var currentMember = workspace.Members.FirstOrDefault(m => m.UserId == userId);
        if (currentMember is null)
            return WorkspaceResult.NotFound();

        // Owners and Admins can add members. Members cannot.
        if (currentMember.Role != WorkspaceRoles.Owner && currentMember.Role != WorkspaceRoles.Admin)
            return WorkspaceResult.Forbidden();

        var targetUser = await userRepository.GetByEmailAsync(request.Email.Trim(), cancellationToken);
        if (targetUser is null)
        {
            return WorkspaceResult.Failure("User with this email address does not exist.");
        }

        var isAlreadyMember = workspace.Members.Any(m => m.UserId == targetUser.Id);
        if (isAlreadyMember)
        {
            return WorkspaceResult.Failure("User is already a member of this workspace.");
        }

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

    public async Task<WorkspaceResult> UpdateMemberRoleAsync(
        Guid workspaceId, 
        Guid currentUserId, 
        Guid targetUserId, 
        UpdateMemberRoleRequest request, 
        CancellationToken cancellationToken)
    {
        var workspace = await workspaceRepository.GetByIdWithMembersAsync(workspaceId, cancellationToken);
        if (workspace is null) return WorkspaceResult.NotFound();

        var currentUserMembership = workspace.Members.FirstOrDefault(m => m.UserId == currentUserId);
        if (currentUserMembership is null) return WorkspaceResult.NotFound();

        // Owners and Admins can manage roles. Members cannot.
        if (currentUserMembership.Role != WorkspaceRoles.Owner && currentUserMembership.Role != WorkspaceRoles.Admin)
        {
            return WorkspaceResult.Forbidden();
        }

        var targetMember = workspace.Members.FirstOrDefault(m => m.UserId == targetUserId);
        if (targetMember is null) return WorkspaceResult.NotFound();

        var newRole = request.Role.Trim();
        if (!WorkspaceRoles.All.Contains(newRole))
        {
            return WorkspaceResult.Failure("Invalid role specified.");
        }

        if (targetMember.Role == WorkspaceRoles.Owner && currentUserId != targetUserId)
        {
            return WorkspaceResult.Forbidden(); // Admins cannot demote an Owner
        }

        if (newRole == WorkspaceRoles.Owner && currentUserMembership.Role != WorkspaceRoles.Owner)
        {
            return WorkspaceResult.Forbidden(); // Only current Owner can assign/transfer ownership
        }

        targetMember.Role = newRole;
        
        if (newRole == WorkspaceRoles.Owner)
        {
            currentUserMembership.Role = WorkspaceRoles.Admin;
            workspace.OwnerUserId = targetUserId;
            workspaceRepository.Update(workspace);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return WorkspaceResult.Success();
    }
}