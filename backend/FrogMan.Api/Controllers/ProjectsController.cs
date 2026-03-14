using FrogMan.Api.Common;
using FrogMan.Application.DTOs.Projects;
using FrogMan.Domain.Entities;
using FrogMan.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FrogMan.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class ProjectsController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpPost("workspaces/{workspaceId:guid}/projects")]
    public async Task<ActionResult<ProjectResponse>> CreateProject(
        Guid workspaceId,
        [FromBody] CreateProjectRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var trimmedName = request.Name?.Trim();

        if (string.IsNullOrWhiteSpace(trimmedName))
            return BadRequest("Project name is required.");

        if (trimmedName.Length > 150)
            return BadRequest("Project name must not exceed 150 characters.");

        if (!string.IsNullOrWhiteSpace(request.Description) && request.Description.Length > 1000)
            return BadRequest("Project description must not exceed 1000 characters.");

        var isWorkspaceMember = await dbContext.WorkspaceMembers
            .AsNoTracking()
            .AnyAsync(
                wm => wm.WorkspaceId == workspaceId && wm.UserId == userId,
                cancellationToken);

        if (!isWorkspaceMember)
            return NotFound();

        var project = new Project
        {
            Name = trimmedName,
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null // String.Empty
                : request.Description.Trim(),
            WorkspaceId = workspaceId,
            CreatedByUserId = userId
        };

        dbContext.Projects.Add(project);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = new ProjectResponse
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            WorkspaceId = project.WorkspaceId,
            CreatedByUserId = project.CreatedByUserId,
            CreatedAt = project.CreatedAt
        };

        return Created($"/api/workspaces/{workspaceId}/projects", response);
    }

    [HttpGet("workspaces/{workspaceId:guid}/projects")]
    public async Task<ActionResult<List<ProjectResponse>>> GetProjectsByWorkspace(
        Guid workspaceId,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var isWorkspaceMember = await dbContext.WorkspaceMembers
            .AsNoTracking()
            .AnyAsync(
                wm => wm.WorkspaceId == workspaceId && wm.UserId == userId,
                cancellationToken);

        if (!isWorkspaceMember)
            return NotFound();

        var projects = await dbContext.Projects
            .AsNoTracking()
            .Where(p => p.WorkspaceId == workspaceId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectResponse
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                WorkspaceId = p.WorkspaceId,
                CreatedByUserId = p.CreatedByUserId,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(projects);
    }
}