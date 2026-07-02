using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FrogMan.Application.DTOs.Workspaces;
using FrogMan.Application.Services;
using FrogMan.Application.Interfaces.Services;
using FrogMan.Api.Common;

namespace FrogMan.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class WorkspaceController(IWorkspaceService workspaceService) : ControllerBase
{
    [HttpPost("workspaces")]
    public async Task<ActionResult<WorkspaceResponse>> CreateWorkspace(
        [FromBody] CreateWorkspaceRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        
        var response = await workspaceService.CreateWorkspaceAsync(userId, request, cancellationToken);

        return CreatedAtAction(
            nameof(GetWorkspaceById),
            new { id = response.Id },
            response);
    }

    [HttpGet("workspaces")]
    public async Task<ActionResult<List<WorkspaceResponse>>> GetMyWorkspaces(
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        
        var workspaces = await workspaceService.GetMyWorkspacesAsync(userId, cancellationToken);
        
        return Ok(workspaces);
    }

    [HttpGet("workspaces/{id:guid}")]
    public async Task<ActionResult<WorkspaceResponse>> GetWorkspaceById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        
        var workspace = await workspaceService.GetWorkspaceByIdAsync(id, userId, cancellationToken);

        if (workspace is null)
            return NotFound();

        return Ok(workspace);
    }

    [HttpPut("workspaces/{id:guid}")]
    public async Task<ActionResult<WorkspaceResponse>> UpdateWorkspace(
        Guid id,
        [FromBody] UpdateWorkspaceRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        
        var result = await workspaceService.UpdateWorkspaceAsync(id, userId, request, cancellationToken);

        if (result.IsNotFound) return NotFound();
        if (result.IsForbidden) return Forbid();

        return Ok(result.Data);
    }

    [HttpDelete("workspaces/{id:guid}")]
    public async Task<IActionResult> DeleteWorkspace(
        Guid id,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        
        var result = await workspaceService.DeleteWorkspaceAsync(id, userId, cancellationToken);

        if (result.IsNotFound) return NotFound();
        if (result.IsForbidden) return Forbid();

        return NoContent();
    }

    [HttpGet("workspaces/{workspaceId:guid}/members")]
    public async Task<ActionResult<List<WorkspaceMemberResponse>>> GetWorkspaceMembers(
        Guid workspaceId,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        
        var members = await workspaceService.GetWorkspaceMembersAsync(workspaceId, userId, cancellationToken);

        if (members is null)
            return NotFound();

        return Ok(members);
    }
}