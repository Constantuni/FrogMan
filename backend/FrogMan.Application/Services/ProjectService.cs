using FrogMan.Domain.Constants;
using FrogMan.Domain.Entities;
using FrogMan.Application.DTOs.Projects;
using FrogMan.Application.Interfaces.Repositories;
using FrogMan.Application.Interfaces.Services;

namespace FrogMan.Application.Services;

public class ProjectService(
    IProjectRepository repository,
    IWorkspaceRepository workspaceRepository) : IProjectService
{
    // HELPER: Verifies if user belongs to workspace and returns their role
    private async Task<string?> GetUserRoleInWorkspaceAsync(Guid workspaceId, Guid userId, CancellationToken cancellationToken)
    {
        var member = await workspaceRepository.GetMemberAsync(workspaceId, userId, cancellationToken);
        return member?.Role;
    }

    public async Task<ProjectResponse?> CreateProjectAsync(
        Guid workspaceId, 
        Guid userId, 
        CreateProjectRequest request, 
        CancellationToken cancellationToken)
    {
        var role = await GetUserRoleInWorkspaceAsync(workspaceId, userId, cancellationToken);
        
        // STRICT GUARD: Only Owners and Admins can create projects
        if (role != WorkspaceRoles.Owner && role != WorkspaceRoles.Admin)
            return null;

        var project = new Project
        {
            Name = request.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            WorkspaceId = workspaceId,
            CreatedByUserId = userId
        };

        repository.Add(project);
        await repository.SaveChangesAsync(cancellationToken);

        return MapToResponse(project);
    }

    public async Task<List<ProjectResponse>?> GetProjectsByWorkspaceAsync(
        Guid workspaceId, 
        Guid userId, 
        CancellationToken cancellationToken)
    {
        var role = await GetUserRoleInWorkspaceAsync(workspaceId, userId, cancellationToken);
        
        // Read guard: Any valid member (Owner, Admin, Member) can view projects
        if (role is null)
            return null;

        var projects = await repository.GetProjectsByWorkspaceAsync(workspaceId, cancellationToken);
        
        return projects.Select(MapToResponse).ToList();
    }

    public async Task<ProjectResponse?> GetProjectByIdAsync(
        Guid workspaceId, 
        Guid projectId, 
        Guid userId, 
        CancellationToken cancellationToken)
    {
        var role = await GetUserRoleInWorkspaceAsync(workspaceId, userId, cancellationToken);
        
        // Read guard: Any valid member can view project details
        if (role is null)
            return null;

        var project = await repository.GetProjectByIdAsync(workspaceId, projectId, cancellationToken);

        return project is null ? null : MapToResponse(project);
    }

    public async Task<ProjectResponse?> UpdateProjectAsync(
        Guid workspaceId, 
        Guid projectId, 
        Guid userId, 
        UpdateProjectRequest request, 
        CancellationToken cancellationToken)
    {
        var role = await GetUserRoleInWorkspaceAsync(workspaceId, userId, cancellationToken);
        
        // STRICT GUARD: Only Owners and Admins can update projects
        if (role != WorkspaceRoles.Owner && role != WorkspaceRoles.Admin)
            return null;

        var project = await repository.GetProjectByIdAsync(workspaceId, projectId, cancellationToken);

        if (project is null)
            return null;

        project.Name = request.Name.Trim();
        project.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();

        await repository.SaveChangesAsync(cancellationToken);

        return MapToResponse(project);
    }

    public async Task<bool> DeleteProjectAsync(
        Guid workspaceId, 
        Guid projectId, 
        Guid userId, 
        CancellationToken cancellationToken)
    {
        var role = await GetUserRoleInWorkspaceAsync(workspaceId, userId, cancellationToken);
        
        // STRICT GUARD: Only Owners and Admins can delete projects
        if (role != WorkspaceRoles.Owner && role != WorkspaceRoles.Admin)
            return false;

        var project = await repository.GetProjectByIdAsync(workspaceId, projectId, cancellationToken);

        if (project is null)
            return false;

        repository.Remove(project);
        await repository.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static ProjectResponse MapToResponse(Project project)
    {
        return new ProjectResponse
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            WorkspaceId = project.WorkspaceId,
            CreatedByUserId = project.CreatedByUserId,
            CreatedAt = project.CreatedAt
        };
    }
}