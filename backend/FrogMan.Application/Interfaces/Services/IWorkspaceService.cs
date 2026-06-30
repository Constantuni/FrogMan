using FrogMan.Application.DTOs.Workspaces;

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
}