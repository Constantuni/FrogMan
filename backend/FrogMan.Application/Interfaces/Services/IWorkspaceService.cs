using FrogMan.Application.DTOs.Workspaces;
using FrogMan.Application.DTOs.WorkspaceMembers;

namespace FrogMan.Application.Interfaces.Services;

public interface IWorkspaceService
{
    Task<WorkspaceResponse> CreateWorkspaceAsync(
        Guid userId, 
        CreateWorkspaceRequest request, 
        CancellationToken cancellationToken);

    Task<List<WorkspaceResponse>> GetMyWorkspacesAsync(
        Guid userId, 
        CancellationToken cancellationToken);

    Task<WorkspaceResponse?> GetWorkspaceByIdAsync(
        Guid id, 
        Guid userId, 
        CancellationToken cancellationToken);

    Task<WorkspaceResult> UpdateWorkspaceAsync(
        Guid id, 
        Guid userId, 
        UpdateWorkspaceRequest request, 
        CancellationToken cancellationToken);

    Task<WorkspaceResult> DeleteWorkspaceAsync(
        Guid id, 
        Guid userId, 
        CancellationToken cancellationToken);

    Task<List<WorkspaceMemberResponse>?> GetWorkspaceMembersAsync(
        Guid workspaceId,
        Guid userId,
        CancellationToken cancellationToken);

    Task<WorkspaceResult> AddMemberByEmailAsync(
        Guid workspaceId, 
        Guid ownerId, 
        AddMemberRequest request, 
        CancellationToken cancellationToken);

    Task<WorkspaceResult> UpdateMemberRoleAsync(
        Guid workspaceId, 
        Guid currentUserId, 
        Guid targetUserId, 
        UpdateMemberRoleRequest request, 
        CancellationToken cancellationToken);
}