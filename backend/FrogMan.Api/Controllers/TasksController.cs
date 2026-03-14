using FrogMan.Api.Common;
using FrogMan.Application.DTOs.Tasks;
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

        var businessRuleError = await ValidateTaskBusinessRulesAsync(
            workspaceId: projectInfo.WorkspaceId,
            assignedToUserId: request.AssignedToUserId,
            cancellationToken: cancellationToken);

        if (businessRuleError is not null)
            return businessRuleError;

        var task = new TaskItem
        {
            ProjectId = projectId,
            Title = request.Title!.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim(),
            Status = request.Status!.Trim(),
            Priority = request.Priority!.Trim(),
            AssignedToUserId = NormalizeOptionalGuid(request.AssignedToUserId),
            DueDate = request.DueDate,
            CreatedByUserId = userId
        };

        dbContext.TaskItems.Add(task);
        await dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(
            nameof(GetTaskById),
            new { taskId = task.Id },
            MapToResponse(task));
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

        var businessRuleError = await ValidateTaskBusinessRulesAsync(
            workspaceId: task.Project.WorkspaceId,
            assignedToUserId: request.AssignedToUserId,
            cancellationToken: cancellationToken);

        if (businessRuleError is not null)
            return businessRuleError;

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

    private async Task<ActionResult?> ValidateTaskBusinessRulesAsync(
        Guid workspaceId,
        Guid? assignedToUserId,
        CancellationToken cancellationToken)
    {
        var normalizedAssignedToUserId = NormalizeOptionalGuid(assignedToUserId);

        if (!normalizedAssignedToUserId.HasValue)
            return null;

        var assigneeIsWorkspaceMember = await dbContext.WorkspaceMembers
            .AsNoTracking()
            .AnyAsync(
                wm => wm.WorkspaceId == workspaceId && wm.UserId == normalizedAssignedToUserId.Value,
                cancellationToken);

        if (!assigneeIsWorkspaceMember)
            return BadRequest("Assigned user must be a member of the workspace.");

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