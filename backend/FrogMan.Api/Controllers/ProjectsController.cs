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

        var isWorkspaceMember = await dbContext.WorkspaceMembers
            .AsNoTracking()
            .AnyAsync(
                wm => wm.WorkspaceId == workspaceId && wm.UserId == userId,
                cancellationToken);

        if (!isWorkspaceMember)
            return NotFound();

        var project = new Project
        {
            Name = request.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
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

        return Created($"/api/workspaces/{workspaceId}/projects/{project.Id}", response);
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

    [HttpGet("workspaces/{workspaceId:guid}/projects/{projectId:guid}")]
    public async Task<ActionResult<ProjectResponse>> GetProjectById(
        Guid workspaceId,
        Guid projectId,
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

        var project = await dbContext.Projects
            .AsNoTracking()
            .Where(p => p.WorkspaceId == workspaceId && p.Id == projectId)
            .Select(p => new ProjectResponse
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                WorkspaceId = p.WorkspaceId,
                CreatedByUserId = p.CreatedByUserId,
                CreatedAt = p.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (project is null)
            return NotFound();

        return Ok(project);
    }

    [HttpPut("workspaces/{workspaceId:guid}/projects/{projectId:guid}")]
    public async Task<ActionResult<ProjectResponse>> UpdateProject(
        Guid workspaceId,
        Guid projectId,
        [FromBody] UpdateProjectRequest request,
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

        var project = await dbContext.Projects
            .FirstOrDefaultAsync(
                p => p.WorkspaceId == workspaceId && p.Id == projectId,
                cancellationToken);

        if (project is null)
            return NotFound();

        project.Name = request.Name.Trim();
        project.Description = string.IsNullOrWhiteSpace(request.Description)
            ? null
            : request.Description.Trim();

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

        return Ok(response);
    }

    [HttpDelete("workspaces/{workspaceId:guid}/projects/{projectId:guid}")]
    public async Task<IActionResult> DeleteProject(
        Guid workspaceId,
        Guid projectId,
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

        var project = await dbContext.Projects
            .FirstOrDefaultAsync(
                p => p.WorkspaceId == workspaceId && p.Id == projectId,
                cancellationToken);

        if (project is null)
            return NotFound();

        dbContext.Projects.Remove(project);
        await dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
