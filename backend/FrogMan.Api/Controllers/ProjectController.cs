// backend/FrogMan.Api/Controllers/ProjectsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FrogMan.Application.DTOs.Projects;
using FrogMan.Application.Interfaces.Services;
using FrogMan.Api.Common;

namespace FrogMan.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class ProjectController(IProjectService projectService) : ControllerBase
{
    [HttpPost("workspaces/{workspaceId:guid}/projects")]
    public async Task<ActionResult<ProjectResponse>> CreateProject(
        Guid workspaceId,
        [FromBody] CreateProjectRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var response = await projectService.CreateProjectAsync(
            workspaceId, 
            userId, 
            request, 
            cancellationToken);

        if (response is null)
            return NotFound();

        return Created($"/api/workspaces/{workspaceId}/projects/{response.Id}", response);
    }

    [HttpGet("workspaces/{workspaceId:guid}/projects")]
    public async Task<ActionResult<List<ProjectResponse>>> GetProjectsByWorkspace(
        Guid workspaceId,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var response = await projectService.GetProjectsByWorkspaceAsync(
            workspaceId, 
            userId, 
            cancellationToken);

        if (response is null)
            return NotFound();

        return Ok(response);
    }

    [HttpGet("workspaces/{workspaceId:guid}/projects/{projectId:guid}")]
    public async Task<ActionResult<ProjectResponse>> GetProjectById(
        Guid workspaceId,
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var response = await projectService.GetProjectByIdAsync(
            workspaceId, 
            projectId, 
            userId, 
            cancellationToken);

        if (response is null)
            return NotFound();

        return Ok(response);
    }

    [HttpPut("workspaces/{workspaceId:guid}/projects/{projectId:guid}")]
    public async Task<ActionResult<ProjectResponse>> UpdateProject(
        Guid workspaceId,
        Guid projectId,
        [FromBody] UpdateProjectRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var response = await projectService.UpdateProjectAsync(
            workspaceId, 
            projectId, 
            userId, 
            request, 
            cancellationToken);

        if (response is null)
            return NotFound();

        return Ok(response);
    }

    [HttpDelete("workspaces/{workspaceId:guid}/projects/{projectId:guid}")]
    public async Task<IActionResult> DeleteProject(
        Guid workspaceId,
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var succeeded = await projectService.DeleteProjectAsync(
            workspaceId, 
            projectId, 
            userId, 
            cancellationToken);

        if (!succeeded)
            return NotFound();

        return NoContent();
    }
}