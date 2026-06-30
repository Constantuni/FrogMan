// backend/FrogMan.Application/Interfaces/Services/IProjectService.cs
using FrogMan.Application.DTOs.Projects;

namespace FrogMan.Application.Interfaces.Services;

public interface IProjectService
{
    Task<ProjectResponse?> CreateProjectAsync(Guid workspaceId, Guid userId, CreateProjectRequest request, CancellationToken cancellationToken);
    Task<List<ProjectResponse>?> GetProjectsByWorkspaceAsync(Guid workspaceId, Guid userId, CancellationToken cancellationToken);
    Task<ProjectResponse?> GetProjectByIdAsync(Guid workspaceId, Guid projectId, Guid userId, CancellationToken cancellationToken);
    Task<ProjectResponse?> UpdateProjectAsync(Guid workspaceId, Guid projectId, Guid userId, UpdateProjectRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteProjectAsync(Guid workspaceId, Guid projectId, Guid userId, CancellationToken cancellationToken);
}