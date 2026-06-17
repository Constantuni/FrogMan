using FrogMan.Domain.Entities;

namespace FrogMan.Application.Interfaces.Repositories;
public interface IWorkspaceRepository
{
    Task AddAsync(Workspace workspace, CancellationToken cancellationToken = default);
    Task AddMemberAsync(WorkspaceMember member, CancellationToken cancellationToken = default);
}