using Microsoft.EntityFrameworkCore;
using FrogMan.Application.Interfaces;
using FrogMan.Domain.Entities;
using FrogMan.Infrastructure.Persistence;
using FrogMan.Application.Interfaces.Repositories;

namespace FrogMan.Infrastructure.Repositories;

public class TaskRepository(ApplicationDbContext dbContext) : ITaskRepository
{
    public async Task<TaskItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await dbContext.TaskItems
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<TaskItem?> GetByIdWithProjectAsync(Guid id, CancellationToken cancellationToken)
    {
        return await dbContext.TaskItems
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<List<TaskItem>> GetByProjectIdAsync(Guid projectId, CancellationToken cancellationToken)
    {
        return await dbContext.TaskItems
            .AsNoTracking()
            .Where(t => t.ProjectId == projectId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Guid?> GetWorkspaceIdByProjectIdAsync(Guid projectId, CancellationToken cancellationToken)
    {
        var projectInfo = await dbContext.Projects
            .AsNoTracking()
            .Where(p => p.Id == projectId)
            .Select(p => new { p.WorkspaceId })
            .FirstOrDefaultAsync(cancellationToken);

        return projectInfo?.WorkspaceId;
    }

    public async Task<bool> IsWorkspaceMemberAsync(Guid workspaceId, Guid userId, CancellationToken cancellationToken)
    {
        return await dbContext.WorkspaceMembers
            .AsNoTracking()
            .AnyAsync(wm => wm.WorkspaceId == workspaceId && wm.UserId == userId, cancellationToken);
    }

    public async System.Threading.Tasks.Task AddAsync(TaskItem task, CancellationToken cancellationToken)
    {
        await dbContext.TaskItems.AddAsync(task, cancellationToken);
    }

    public System.Threading.Tasks.Task DeleteAsync(TaskItem task)
    {
        dbContext.TaskItems.Remove(task);
        return System.Threading.Tasks.Task.CompletedTask;
    }

    public async System.Threading.Tasks.Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}