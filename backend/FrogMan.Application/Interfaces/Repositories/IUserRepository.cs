using FrogMan.Domain.Entities;

namespace FrogMan.Application.Interfaces.Repositories;

public interface IUserRepository
{
    Task<bool> ExistsAsync(string email, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
}