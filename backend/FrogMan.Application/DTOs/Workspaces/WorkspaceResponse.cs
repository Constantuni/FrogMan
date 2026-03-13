namespace FrogMan.Application.DTOs.Workspaces;

public class WorkspaceResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid OwnerUserId { get; set; }
    public DateTime CreatedAt { get; set; }
}