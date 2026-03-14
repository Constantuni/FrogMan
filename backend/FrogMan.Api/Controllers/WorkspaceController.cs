using FrogMan.Api.Common;
using FrogMan.Application.DTOs.Workspaces;
using FrogMan.Domain.Constants;
using FrogMan.Domain.Entities;
using FrogMan.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FrogMan.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkspacesController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<WorkspaceResponse>> CreateWorkspace(
        [FromBody] CreateWorkspaceRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var workspace = new Workspace
        {
            Name = request.Name.Trim(),
            OwnerUserId = userId
        };

        var ownerMembership = new WorkspaceMember
        {
            WorkspaceId = workspace.Id,
            UserId = userId,
            Role = WorkspaceRoles.Owner
        };

        dbContext.Workspaces.Add(workspace);
        dbContext.WorkspaceMembers.Add(ownerMembership);

        await dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(
            nameof(GetWorkspaceById),
            new { id = workspace.Id },
            MapToResponse(workspace));
    }

    [HttpGet]
    public async Task<ActionResult<List<WorkspaceResponse>>> GetMyWorkspaces(
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var workspaces = await dbContext.Workspaces
            .AsNoTracking()
            .Where(w => w.Members.Any(m => m.UserId == userId))
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new WorkspaceResponse
            {
                Id = w.Id,
                Name = w.Name,
                OwnerUserId = w.OwnerUserId,
                CreatedAt = w.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(workspaces);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WorkspaceResponse>> GetWorkspaceById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var workspace = await dbContext.Workspaces
            .AsNoTracking()
            .Where(w => w.Id == id && w.Members.Any(m => m.UserId == userId))
            .Select(w => new WorkspaceResponse
            {
                Id = w.Id,
                Name = w.Name,
                OwnerUserId = w.OwnerUserId,
                CreatedAt = w.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (workspace is null)
            return NotFound();

        return Ok(workspace);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<WorkspaceResponse>> UpdateWorkspace(
        Guid id,
        [FromBody] UpdateWorkspaceRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var workspace = await dbContext.Workspaces
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);

        if (workspace is null)
            return NotFound();

        var membership = await dbContext.WorkspaceMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(
                wm => wm.WorkspaceId == id && wm.UserId == userId,
                cancellationToken);

        if (membership is null)
            return NotFound();

        if (workspace.OwnerUserId != userId)
            return Forbid();

        workspace.Name = request.Name.Trim();

        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(MapToResponse(workspace));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteWorkspace(
        Guid id,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var workspace = await dbContext.Workspaces
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);

        if (workspace is null)
            return NotFound();

        var membership = await dbContext.WorkspaceMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(
                wm => wm.WorkspaceId == id && wm.UserId == userId,
                cancellationToken);

        if (membership is null)
            return NotFound();

        if (workspace.OwnerUserId != userId)
            return Forbid();

        dbContext.Workspaces.Remove(workspace);
        await dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private static WorkspaceResponse MapToResponse(Workspace workspace)
    {
        return new WorkspaceResponse
        {
            Id = workspace.Id,
            Name = workspace.Name,
            OwnerUserId = workspace.OwnerUserId,
            CreatedAt = workspace.CreatedAt
        };
    }
}