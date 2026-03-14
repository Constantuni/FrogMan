using FrogMan.Domain.Constants;

namespace FrogMan.Application.DTOs.Tasks;

public class CreateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = TaskStatuses.ToDo;
    public string Priority { get; set; } = TaskPriorities.Medium;
    public Guid? AssignedToUserId { get; set; }
    public DateTime? DueDate { get; set; }
}