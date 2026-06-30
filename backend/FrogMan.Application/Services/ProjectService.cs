using FrogMan.Domain.Entities;
using FrogMan.Application.DTOs.Projects;
using FrogMan.Application.Interfaces.Repositories;
using FrogMan.Application.Interfaces.Services;

namespace FrogMan.Application.Services;

public class ProjectService(IProjectRepository repository) : IProjectService
{
    public async Task<ProjectResponse?> CreateProjectAsync(
        Guid workspaceId, 
        Guid userId, 
        CreateProjectRequest request, 
        CancellationToken cancellationToken)
    {
        if (!await repository.IsWorkspaceMemberAsync(workspaceId, userId, cancellationToken))
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
        if (!await repository.IsWorkspaceMemberAsync(workspaceId, userId, cancellationToken))
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
        if (!await repository.IsWorkspaceMemberAsync(workspaceId, userId, cancellationToken))
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
        if (!await repository.IsWorkspaceMemberAsync(workspaceId, userId, cancellationToken))
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
        if (!await repository.IsWorkspaceMemberAsync(workspaceId, userId, cancellationToken))
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