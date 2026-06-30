using FrogMan.Domain.Entities;

namespace FrogMan.Application.Interfaces.Repositories;

public interface IProjectRepository
{
    Task<bool> IsWorkspaceMemberAsync(Guid workspaceId, Guid userId, CancellationToken cancellationToken);
    Task<List<Project>> GetProjectsByWorkspaceAsync(Guid workspaceId, CancellationToken cancellationToken);
    Task<Project?> GetProjectByIdAsync(Guid workspaceId, Guid projectId, CancellationToken cancellationToken);
    void Add(Project project);
    void Remove(Project project);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}