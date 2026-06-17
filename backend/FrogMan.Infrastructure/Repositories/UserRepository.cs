using Microsoft.EntityFrameworkCore;
using FrogMan.Application.Interfaces;
using FrogMan.Application.Interfaces.Repositories;
using FrogMan.Domain.Entities;
using FrogMan.Infrastructure.Persistence;

namespace FrogMan.Infrastructure.Repositories;

public class UserRepository : IUserRepository 
{
    private readonly ApplicationDbContext _context;
    
    public UserRepository(ApplicationDbContext context) 
    {
        _context = context;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
    }

    public async Task<bool> ExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AnyAsync(u => u.Email == email, cancellationToken);
    }
}