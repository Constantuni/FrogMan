using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FrogMan.Domain.Entities;

namespace FrogMan.Infrastructure.Persistence.Configurations;

public class WorkspaceConfiguration : IEntityTypeConfiguration<Workspace>
{
    public void Configure(EntityTypeBuilder<Workspace> builder)
    {
        builder.HasKey(w => w.Id);

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.HasOne(w => w.OwnerUser)
            .WithMany(u => u.OwnedWorkspaces)
            .HasForeignKey(w => w.OwnerUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}