using FrogMan.Domain.Entities;

namespace FrogMan.Application.Interfaces.Repositories;

public interface ITaskRepository
{
    Task<TaskItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<TaskItem?> GetByIdWithProjectAsync(Guid id, CancellationToken cancellationToken);
    Task<List<TaskItem>> GetByProjectIdAsync(Guid projectId, CancellationToken cancellationToken);
    Task<Guid?> GetWorkspaceIdByProjectIdAsync(Guid projectId, CancellationToken cancellationToken);
    Task<bool> IsWorkspaceMemberAsync(Guid workspaceId, Guid userId, CancellationToken cancellationToken);
    System.Threading.Tasks.Task AddAsync(TaskItem task, CancellationToken cancellationToken);
    System.Threading.Tasks.Task DeleteAsync(TaskItem task);
    System.Threading.Tasks.Task SaveChangesAsync(CancellationToken cancellationToken);
}