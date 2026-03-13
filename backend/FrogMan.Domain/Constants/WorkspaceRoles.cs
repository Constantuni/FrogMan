namespace FrogMan.Domain.Constants;

public static class WorkspaceRoles
{
    public const string Owner = "Owner";
    public const string Admin = "Admin";
    public const string Member = "Member";

    public static readonly HashSet<string> All = new()
    {
        Owner,
        Admin,
        Member
    };
}