using Microsoft.EntityFrameworkCore;
using FrogMan.Domain.Entities;

namespace FrogMan.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresExtension("citext");

        modelBuilder.Entity<User>(entity => 
        {
            entity.Property(u => u.Email)
                .HasColumnType("citext");

            entity.HasIndex(u => u.Email)
                .IsUnique();
        });

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var properties = entityType.GetProperties()
                .Where(p => p.ClrType == typeof(DateTime) || p.ClrType == typeof(DateTime?));
            
            foreach (var property in properties)
            {
                property.SetColumnType("timestamp with time zone");
            }
        }
    }
}