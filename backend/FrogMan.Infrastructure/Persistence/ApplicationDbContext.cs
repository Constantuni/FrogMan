// backend/FrogMan.Infrastructure/Persistence/ApplicationDbContext.cs
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using FrogMan.Domain.Entities;

namespace FrogMan.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Workspace> Workspaces => Set<Workspace>();
    public DbSet<WorkspaceMember> WorkspaceMembers => Set<WorkspaceMember>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<TaskItem> TaskItems => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Keep database-wide settings here
        modelBuilder.HasPostgresExtension("citext");

        // Automatically load all IEntityTypeConfiguration classes from this assembly!
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Keep your global timestamp conversion here
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