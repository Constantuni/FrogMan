using FrogMan.Application.DTOs.Tasks;

namespace FrogMan.Application.Interfaces.Services;

public interface ITaskService
{
    Task<Result<TaskResponse>> CreateTaskAsync(Guid projectId, Guid userId, CreateTaskRequest request, CancellationToken cancellationToken);
    Task<Result<List<TaskResponse>>> GetTasksByProjectAsync(Guid projectId, Guid userId, CancellationToken cancellationToken);
    Task<Result<TaskResponse>> GetTaskByIdAsync(Guid taskId, Guid userId, CancellationToken cancellationToken);
    Task<Result<TaskResponse>> UpdateTaskAsync(Guid taskId, Guid userId, UpdateTaskRequest request, CancellationToken cancellationToken);
    Task<Result<bool>> DeleteTaskAsync(Guid taskId, Guid userId, CancellationToken cancellationToken);
}

// Simple orchestration result pattern to keep the application layer isolated from ASP.NET Core ActionResult types.
public class Result<T>
{
    public T? Value { get; set; }
    public bool IsNotFound { get; set; }
    public string? ErrorMessage { get; set; }
    public bool IsSuccess => !IsNotFound && ErrorMessage == null;

    public static Result<T> Success(T value) => new() { Value = value };
    public static Result<T> NotFound() => new() { IsNotFound = true };
    public static Result<T> Failure(string message) => new() { ErrorMessage = message };
}