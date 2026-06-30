using Microsoft.EntityFrameworkCore;
using FrogMan.Domain.Entities;
using FrogMan.Application.Interfaces.Repositories;
using FrogMan.Infrastructure.Persistence;

namespace FrogMan.Infrastructure.Repositories;

public class ProjectRepository(ApplicationDbContext dbContext) : IProjectRepository
{
    public async Task<bool> IsWorkspaceMemberAsync(Guid workspaceId, Guid userId, CancellationToken cancellationToken)
    {
        return await dbContext.WorkspaceMembers
            .AsNoTracking()
            .AnyAsync(wm => wm.WorkspaceId == workspaceId && wm.UserId == userId, cancellationToken);
    }

    public async Task<List<Project>> GetProjectsByWorkspaceAsync(Guid workspaceId, CancellationToken cancellationToken)
    {
        return await dbContext.Projects
            .AsNoTracking()
            .Where(p => p.WorkspaceId == workspaceId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Project?> GetProjectByIdAsync(Guid workspaceId, Guid projectId, CancellationToken cancellationToken)
    {
        return await dbContext.Projects
            .FirstOrDefaultAsync(p => p.WorkspaceId == workspaceId && p.Id == projectId, cancellationToken);
    }

    public void Add(Project project) => dbContext.Projects.Add(project);

    public void Remove(Project project) => dbContext.Projects.Remove(project);

    public async Task SaveChangesAsync(CancellationToken cancellationToken) => 
        await dbContext.SaveChangesAsync(cancellationToken);
}