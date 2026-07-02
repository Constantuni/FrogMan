// backend/FrogMan.Application/Interfaces/Repositories/IWorkspaceRepository.cs
using FrogMan.Domain.Entities;

namespace FrogMan.Application.Interfaces.Repositories;

public interface IWorkspaceRepository
{
    Task AddAsync(Workspace workspace, CancellationToken cancellationToken = default);
    Task AddMemberAsync(WorkspaceMember member, CancellationToken cancellationToken = default);
    
    Task<List<Workspace>> GetWorkspacesByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Workspace?> GetByIdWithMembersAsync(Guid id, CancellationToken cancellationToken = default);
    
    Task<WorkspaceMember?> GetMemberAsync(Guid workspaceId, Guid userId, CancellationToken cancellationToken = default);
    
    void Update(Workspace workspace);
    void Delete(Workspace workspace);
}