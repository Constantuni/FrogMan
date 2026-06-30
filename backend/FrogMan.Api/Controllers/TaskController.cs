using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FrogMan.Application.DTOs.Tasks;
using FrogMan.Application.Interfaces;
using FrogMan.Application.Interfaces.Services;
using FrogMan.Api.Common;

namespace FrogMan.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class TaskController(ITaskService taskService) : ControllerBase
{
    [HttpPost("projects/{projectId:guid}/tasks")]
    public async Task<ActionResult<TaskResponse>> CreateTask(
        Guid projectId,
        [FromBody] CreateTaskRequest request,
        CancellationToken cancellationToken)
    {
        var result = await taskService.CreateTaskAsync(projectId, User.GetUserId(), request, cancellationToken);

        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(result.ErrorMessage);

        return CreatedAtAction(
            nameof(GetTaskById),
            new { taskId = result.Value!.Id },
            result.Value);
    }

    [HttpGet("projects/{projectId:guid}/tasks")]
    public async Task<ActionResult<List<TaskResponse>>> GetTasksByProject(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var result = await taskService.GetTasksByProjectAsync(projectId, User.GetUserId(), cancellationToken);

        if (result.IsNotFound) return NotFound();

        return Ok(result.Value);
    }

    [HttpGet("tasks/{taskId:guid}")]
    public async Task<ActionResult<TaskResponse>> GetTaskById(
        Guid taskId,
        CancellationToken cancellationToken)
    {
        var result = await taskService.GetTaskByIdAsync(taskId, User.GetUserId(), cancellationToken);

        if (result.IsNotFound) return NotFound();

        return Ok(result.Value);
    }

    [HttpPut("tasks/{taskId:guid}")]
    public async Task<ActionResult<TaskResponse>> UpdateTask(
        Guid taskId,
        [FromBody] UpdateTaskRequest request,
        CancellationToken cancellationToken)
    {
        var result = await taskService.UpdateTaskAsync(taskId, User.GetUserId(), request, cancellationToken);

        if (result.IsNotFound) return NotFound();
        if (!result.IsSuccess) return BadRequest(result.ErrorMessage);

        return Ok(result.Value);
    }

    [HttpDelete("tasks/{taskId:guid}")]
    public async Task<IActionResult> DeleteTask(
        Guid taskId,
        CancellationToken cancellationToken)
    {
        var result = await taskService.DeleteTaskAsync(taskId, User.GetUserId(), cancellationToken);

        if (result.IsNotFound) return NotFound();

        return NoContent();
    }
}