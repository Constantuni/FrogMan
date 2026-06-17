using Microsoft.EntityFrameworkCore;
using FrogMan.Application.Interfaces.Repositories;
using FrogMan.Domain.Entities;
using FrogMan.Infrastructure.Persistence;

namespace FrogMan.Infrastructure.Repositories;

public class WorkspaceRepository : IWorkspaceRepository
{
    private readonly ApplicationDbContext _context;

    public WorkspaceRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Workspace workspace, CancellationToken cancellationToken = default)
    {
        await _context.Workspaces.AddAsync(workspace, cancellationToken);
    }

    public async Task AddMemberAsync(WorkspaceMember member, CancellationToken cancellationToken = default)
    {
        await _context.WorkspaceMembers.AddAsync(member, cancellationToken);
    }
}