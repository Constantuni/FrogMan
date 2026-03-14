namespace FrogMan.Domain.Constants;

public static class TaskPriorities
{
    public const string Low = "Low";
    public const string Medium = "Medium";
    public const string High = "High";

    public static readonly HashSet<string> All = new()
    {
        Low,
        Medium,
        High
    };
}