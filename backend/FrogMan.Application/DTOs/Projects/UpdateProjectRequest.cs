namespace FrogMan.Application.DTOs.Projects;

public class UpdateProjectRequest
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
}
