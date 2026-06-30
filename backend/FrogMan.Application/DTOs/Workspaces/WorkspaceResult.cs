using FrogMan.Application.DTOs.Workspaces;

namespace FrogMan.Application.DTOs.Workspaces;

public class WorkspaceResult
{
    public bool IsSuccess { get; private init; }
    public bool IsNotFound { get; private init; }
    public bool IsForbidden { get; private init; }
    public WorkspaceResponse? Data { get; private init; }

    public static WorkspaceResult Success(WorkspaceResponse? data = null) => new() { IsSuccess = true, Data = data };
    public static WorkspaceResult NotFound() => new() { IsNotFound = true };
    public static WorkspaceResult Forbidden() => new() { IsForbidden = true };
}