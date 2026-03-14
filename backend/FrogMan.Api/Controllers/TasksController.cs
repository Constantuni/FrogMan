using FrogMan.Api.Common;
using FrogMan.Application.DTOs.Tasks;
using FrogMan.Domain.Constants;
using FrogMan.Domain.Entities;
using FrogMan.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FrogMan.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class TasksController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpPost("projects/{projectId:guid}/tasks")]
    public async Task<ActionResult<TaskResponse>> CreateTask(
        Guid projectId,
        [FromBody] CreateTaskRequest request,
        CancellationToken cancellationToken)
    {
        if (request is null)
            return BadRequest("Request body is required.");

        var userId = User.GetUserId();

        var projectInfo = await dbContext.Projects
            .AsNoTracking()
            .Where(p => p.Id == projectId)
            .Select(p => new
            {
                p.Id,
                p.WorkspaceId
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (projectInfo is null)
            return NotFound();

        var isWorkspaceMember = await dbContext.WorkspaceMembers
            .AsNoTracking()
            .AnyAsync(
                wm => wm.WorkspaceId == projectInfo.WorkspaceId && wm.UserId == userId,
                cancellationToken);

        if (!isWorkspaceMember)
            return NotFound();

        var validationError = await ValidateTaskRequestAsync(
            workspaceId: projectInfo.WorkspaceId,
            title: request.Title,
            description: request.Description,
            status: request.Status,
            priority: request.Priority,
            assignedToUserId: request.AssignedToUserId,
            cancellationToken: cancellationToken);

        if (validationError is not null)
            return validationError;

        var normalizedTitle = request.Title!.Trim();
        var normalizedDescription = string.IsNullOrWhiteSpace(request.Description)
            ? null
            : request.Description.Trim();

        var normalizedStatus = request.Status!.Trim();
        var normalizedPriority = request.Priority!.Trim();
        var normalizedAssignedToUserId = NormalizeOptionalGuid(request.AssignedToUserId);

        var task = new TaskItem
        {
            ProjectId = projectId,
            Title = normalizedTitle,
            Description = normalizedDescription,
            Status = normalizedStatus,
            Priority = normalizedPriority,
            AssignedToUserId = normalizedAssignedToUserId,
            DueDate = request.DueDate,
            CreatedByUserId = userId
        };

        dbContext.TaskItems.Add(task);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = MapToResponse(task);

        return CreatedAtAction(nameof(GetTaskById), new { taskId = task.Id }, response);
    }

    [HttpGet("projects/{projectId:guid}/tasks")]
    public async Task<ActionResult<List<TaskResponse>>> GetTasksByProject(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var projectInfo = await dbContext.Projects
            .AsNoTracking()
            .Where(p => p.Id == projectId)
            .Select(p => new
            {
                p.Id,
                p.WorkspaceId
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (projectInfo is null)
            return NotFound();

        var isWorkspaceMember = await dbContext.WorkspaceMembers
            .AsNoTracking()
            .AnyAsync(
                wm => wm.WorkspaceId == projectInfo.WorkspaceId && wm.UserId == userId,
                cancellationToken);

        if (!isWorkspaceMember)
            return NotFound();

        var tasks = await dbContext.TaskItems
            .AsNoTracking()
            .Where(t => t.ProjectId == projectId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TaskResponse
            {
                Id = t.Id,
                ProjectId = t.ProjectId,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                Priority = t.Priority,
                CreatedByUserId = t.CreatedByUserId,
                AssignedToUserId = t.AssignedToUserId,
                DueDate = t.DueDate,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(tasks);
    }

    [HttpGet("tasks/{taskId:guid}")]
    public async Task<ActionResult<TaskResponse>> GetTaskById(
        Guid taskId,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var task = await dbContext.TaskItems
            .AsNoTracking()
            .Where(t => t.Id == taskId)
            .Select(t => new
            {
                Entity = t,
                WorkspaceId = t.Project.WorkspaceId
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (task is null)
            return NotFound();

        var isWorkspaceMember = await dbContext.WorkspaceMembers
            .AsNoTracking()
            .AnyAsync(
                wm => wm.WorkspaceId == task.WorkspaceId && wm.UserId == userId,
                cancellationToken);

        if (!isWorkspaceMember)
            return NotFound();

        return Ok(MapToResponse(task.Entity));
    }

    [HttpPut("tasks/{taskId:guid}")]
    public async Task<ActionResult<TaskResponse>> UpdateTask(
        Guid taskId,
        [FromBody] UpdateTaskRequest request,
        CancellationToken cancellationToken)
    {
        if (request is null)
            return BadRequest("Request body is required.");

        var userId = User.GetUserId();

        var task = await dbContext.TaskItems
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken);

        if (task is null)
            return NotFound();

        var isWorkspaceMember = await dbContext.WorkspaceMembers
            .AsNoTracking()
            .AnyAsync(
                wm => wm.WorkspaceId == task.Project.WorkspaceId && wm.UserId == userId,
                cancellationToken);

        if (!isWorkspaceMember)
            return NotFound();

        var validationError = await ValidateTaskRequestAsync(
            workspaceId: task.Project.WorkspaceId,
            title: request.Title,
            description: request.Description,
            status: request.Status,
            priority: request.Priority,
            assignedToUserId: request.AssignedToUserId,
            cancellationToken: cancellationToken);

        if (validationError is not null)
            return validationError;

        task.Title = request.Title!.Trim();
        task.Description = string.IsNullOrWhiteSpace(request.Description)
            ? null
            : request.Description.Trim();
        task.Status = request.Status!.Trim();
        task.Priority = request.Priority!.Trim();
        task.AssignedToUserId = NormalizeOptionalGuid(request.AssignedToUserId);
        task.DueDate = request.DueDate;
        task.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(MapToResponse(task));
    }

    [HttpDelete("tasks/{taskId:guid}")]
    public async Task<IActionResult> DeleteTask(
        Guid taskId,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var task = await dbContext.TaskItems
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken);

        if (task is null)
            return NotFound();

        var isWorkspaceMember = await dbContext.WorkspaceMembers
            .AsNoTracking()
            .AnyAsync(
                wm => wm.WorkspaceId == task.Project.WorkspaceId && wm.UserId == userId,
                cancellationToken);

        if (!isWorkspaceMember)
            return NotFound();

        dbContext.TaskItems.Remove(task);
        await dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private async Task<ActionResult?> ValidateTaskRequestAsync(
        Guid workspaceId,
        string? title,
        string? description,
        string? status,
        string? priority,
        Guid? assignedToUserId,
        CancellationToken cancellationToken)
    {
        var trimmedTitle = title?.Trim();
        var trimmedDescription = description?.Trim();
        var trimmedStatus = status?.Trim();
        var trimmedPriority = priority?.Trim();
        var normalizedAssignedToUserId = NormalizeOptionalGuid(assignedToUserId);

        if (string.IsNullOrWhiteSpace(trimmedTitle))
            return BadRequest("Task title is required.");

        if (trimmedTitle.Length > 200)
            return BadRequest("Task title must not exceed 200 characters.");

        if (!string.IsNullOrWhiteSpace(trimmedDescription) && trimmedDescription.Length > 2000)
            return BadRequest("Task description must not exceed 2000 characters.");

        if (string.IsNullOrWhiteSpace(trimmedStatus))
            return BadRequest("Task status is required.");

        if (!TaskStatuses.All.Contains(trimmedStatus))
            return BadRequest("Invalid task status.");

        if (string.IsNullOrWhiteSpace(trimmedPriority))
            return BadRequest("Task priority is required.");

        if (!TaskPriorities.All.Contains(trimmedPriority))
            return BadRequest("Invalid task priority.");

        if (normalizedAssignedToUserId.HasValue)
        {
            var assigneeIsWorkspaceMember = await dbContext.WorkspaceMembers
                .AsNoTracking()
                .AnyAsync(
                    wm => wm.WorkspaceId == workspaceId && wm.UserId == normalizedAssignedToUserId.Value,
                    cancellationToken);

            if (!assigneeIsWorkspaceMember)
                return BadRequest("Assigned user must be a member of the workspace.");
        }

        return null;
    }

    private static Guid? NormalizeOptionalGuid(Guid? value)
    {
        return value is null || value == Guid.Empty
            ? null
            : value;
    }

    private static TaskResponse MapToResponse(TaskItem task)
    {
        return new TaskResponse
        {
            Id = task.Id,
            ProjectId = task.ProjectId,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            CreatedByUserId = task.CreatedByUserId,
            AssignedToUserId = task.AssignedToUserId,
            DueDate = task.DueDate,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        };
    }
}