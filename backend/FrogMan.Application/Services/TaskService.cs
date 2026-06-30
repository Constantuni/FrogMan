using FrogMan.Application.DTOs.Tasks;
using FrogMan.Application.Interfaces;
using FrogMan.Application.Interfaces.Repositories;
using FrogMan.Application.Interfaces.Services;
using FrogMan.Domain.Entities;

namespace FrogMan.Application.Services;

public class TaskService(ITaskRepository repository) : ITaskService
{
    public async Task<Result<TaskResponse>> CreateTaskAsync(Guid projectId, Guid userId, CreateTaskRequest request, CancellationToken cancellationToken)
    {
        var workspaceId = await repository.GetWorkspaceIdByProjectIdAsync(projectId, cancellationToken);
        if (workspaceId is null) return Result<TaskResponse>.NotFound();

        if (!await repository.IsWorkspaceMemberAsync(workspaceId.Value, userId, cancellationToken))
            return Result<TaskResponse>.NotFound();

        var businessRuleError = await ValidateTaskBusinessRulesAsync(workspaceId.Value, request.AssignedToUserId, cancellationToken);
        if (businessRuleError is not null) return Result<TaskResponse>.Failure(businessRuleError);

        var task = new TaskItem
        {
            ProjectId = projectId,
            Title = request.Title!.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            Status = request.Status!.Trim(),
            Priority = request.Priority!.Trim(),
            AssignedToUserId = NormalizeOptionalGuid(request.AssignedToUserId),
            DueDate = request.DueDate,
            CreatedByUserId = userId
        };

        await repository.AddAsync(task, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return Result<TaskResponse>.Success(MapToResponse(task));
    }

    public async Task<Result<List<TaskResponse>>> GetTasksByProjectAsync(Guid projectId, Guid userId, CancellationToken cancellationToken)
    {
        var workspaceId = await repository.GetWorkspaceIdByProjectIdAsync(projectId, cancellationToken);
        if (workspaceId is null) return Result<List<TaskResponse>>.NotFound();

        if (!await repository.IsWorkspaceMemberAsync(workspaceId.Value, userId, cancellationToken))
            return Result<List<TaskResponse>>.NotFound();

        var tasks = await repository.GetByProjectIdAsync(projectId, cancellationToken);
        return Result<List<TaskResponse>>.Success(tasks.Select(MapToResponse).ToList());
    }

    public async Task<Result<TaskResponse>> GetTaskByIdAsync(Guid taskId, Guid userId, CancellationToken cancellationToken)
    {
        var task = await repository.GetByIdWithProjectAsync(taskId, cancellationToken);
        if (task is null) return Result<TaskResponse>.NotFound();

        if (!await repository.IsWorkspaceMemberAsync(task.Project.WorkspaceId, userId, cancellationToken))
            return Result<TaskResponse>.NotFound();

        return Result<TaskResponse>.Success(MapToResponse(task));
    }

    public async Task<Result<TaskResponse>> UpdateTaskAsync(Guid taskId, Guid userId, UpdateTaskRequest request, CancellationToken cancellationToken)
    {
        var task = await repository.GetByIdWithProjectAsync(taskId, cancellationToken);
        if (task is null) return Result<TaskResponse>.NotFound();

        if (!await repository.IsWorkspaceMemberAsync(task.Project.WorkspaceId, userId, cancellationToken))
            return Result<TaskResponse>.NotFound();

        var businessRuleError = await ValidateTaskBusinessRulesAsync(task.Project.WorkspaceId, request.AssignedToUserId, cancellationToken);
        if (businessRuleError is not null) return Result<TaskResponse>.Failure(businessRuleError);

        task.Title = request.Title!.Trim();
        task.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        task.Status = request.Status!.Trim();
        task.Priority = request.Priority!.Trim();
        task.AssignedToUserId = NormalizeOptionalGuid(request.AssignedToUserId);
        task.DueDate = request.DueDate;
        task.UpdatedAt = DateTime.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);

        return Result<TaskResponse>.Success(MapToResponse(task));
    }

    public async Task<Result<bool>> DeleteTaskAsync(Guid taskId, Guid userId, CancellationToken cancellationToken)
    {
        var task = await repository.GetByIdWithProjectAsync(taskId, cancellationToken);
        if (task is null) return Result<bool>.NotFound();

        if (!await repository.IsWorkspaceMemberAsync(task.Project.WorkspaceId, userId, cancellationToken))
            return Result<bool>.NotFound();

        await repository.DeleteAsync(task);
        await repository.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }

    private async Task<string?> ValidateTaskBusinessRulesAsync(Guid workspaceId, Guid? assignedToUserId, CancellationToken cancellationToken)
    {
        var normalizedAssignedToUserId = NormalizeOptionalGuid(assignedToUserId);
        if (!normalizedAssignedToUserId.HasValue) return null;

        var assigneeIsWorkspaceMember = await repository.IsWorkspaceMemberAsync(workspaceId, normalizedAssignedToUserId.Value, cancellationToken);
        if (!assigneeIsWorkspaceMember) return "Assigned user must be a member of the workspace.";

        return null;
    }

    private static Guid? NormalizeOptionalGuid(Guid? value) => value is null || value == Guid.Empty ? null : value;

    private static TaskResponse MapToResponse(TaskItem task) => new()
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