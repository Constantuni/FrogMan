namespace FrogMan.Domain.Constants;

public static class TaskStatuses
{
    public const string ToDo = "ToDo";
    public const string InProgress = "InProgress";
    public const string InReview = "InReview";
    public const string Done = "Done";

    public static readonly HashSet<string> All = new()
    {
        ToDo,
        InProgress,
        InReview,
        Done
    };
}