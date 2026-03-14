using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace FrogMan.Api.Common;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(claim, out var id))
            throw new UnauthorizedAccessException("Invalid user id");

        return id;
    }
}