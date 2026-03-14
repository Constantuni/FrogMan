using FrogMan.Domain.Constants;

namespace FrogMan.Domain.Entities;

public class WorkspaceMember
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Role { get; set; } = WorkspaceRoles.Member;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}