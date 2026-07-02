using Microsoft.EntityFrameworkCore;
using FrogMan.Domain.Entities;
using FrogMan.Application.Interfaces.Repositories;
using FrogMan.Infrastructure.Persistence;

namespace FrogMan.Infrastructure.Repositories;

public class WorkspaceRepository(ApplicationDbContext dbContext) : IWorkspaceRepository
{
    public async Task AddAsync(Workspace workspace, CancellationToken cancellationToken = default)
    {
        await dbContext.Workspaces.AddAsync(workspace, cancellationToken);
    }

    public async Task AddMemberAsync(WorkspaceMember member, CancellationToken cancellationToken = default)
    {
        await dbContext.WorkspaceMembers.AddAsync(member, cancellationToken);
    }

    public async Task<List<Workspace>> GetWorkspacesByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Workspaces
            .AsNoTracking()
            .Where(w => w.Members.Any(m => m.UserId == userId))
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Workspace?> GetByIdWithMembersAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Workspaces
            .Include(w => w.Members)
            .ThenInclude(m => m.User) 
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
    }

    public void Update(Workspace workspace)
    {
        dbContext.Workspaces.Update(workspace);
    }

    public void Delete(Workspace workspace)
    {
        dbContext.Workspaces.Remove(workspace);
    }
}