using FrogMan.Application.Interfaces.Repositories;
using FrogMan.Infrastructure.Persistence;

namespace FrogMan.Infrastructure.Repositories;

public class UnitOfWork(ApplicationDbContext context) : IUnitOfWork
{
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await context.SaveChangesAsync(cancellationToken);
    }
}