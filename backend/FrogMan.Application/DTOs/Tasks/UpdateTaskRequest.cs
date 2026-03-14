namespace FrogMan.Application.DTOs.Tasks;

public class UpdateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public Guid? AssignedToUserId { get; set; }
    public DateTime? DueDate { get; set; }
}