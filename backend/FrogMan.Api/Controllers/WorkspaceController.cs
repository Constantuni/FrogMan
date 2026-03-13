using FrogMan.Api.Common;
using FrogMan.Application.DTOs.Workspaces;
using FrogMan.Domain.Entities;
using FrogMan.Domain.Constants;
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

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Workspace name is required.");

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

        var response = new WorkspaceResponse
        {
            Id = workspace.Id,
            Name = workspace.Name,
            OwnerUserId = workspace.OwnerUserId,
            CreatedAt = workspace.CreatedAt
        };

        return CreatedAtAction(nameof(GetWorkspaceById), new { id = workspace.Id }, response);
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
}