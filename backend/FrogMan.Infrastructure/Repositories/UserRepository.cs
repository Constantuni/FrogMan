using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using FrogMan.Application.Interfaces;
using FrogMan.Application.Interfaces.Repositories;
using FrogMan.Domain.Entities;
using FrogMan.Infrastructure.Persistence;

namespace FrogMan.Infrastructure.Repositories;

public class UserRepository(ApplicationDbContext context) : IUserRepository 
{
    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        // Simply return the user or null. Let DB connection errors bubble up.
        return await context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await context.Users.AddAsync(user, cancellationToken);
    }

    public async Task<bool> ExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        return await context.Users
            .AnyAsync(u => u.Email == email, cancellationToken);
    }
}