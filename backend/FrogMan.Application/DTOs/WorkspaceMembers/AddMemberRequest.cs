namespace FrogMan.Application.DTOs.WorkspaceMembers;

public class AddMemberRequest
{
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = FrogMan.Domain.Constants.WorkspaceRoles.Member;
}