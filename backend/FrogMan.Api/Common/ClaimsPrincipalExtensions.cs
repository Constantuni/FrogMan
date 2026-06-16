using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace FrogMan.Api.Common;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        if (user is null)
            throw new ArgumentNullException(nameof(user));

        var userIdClaim =
            user.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim))
            throw new UnauthorizedAccessException("User ID claim is missing.");

        if (!Guid.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("User ID claim is invalid.");

        return userId;
    }

    public static string GetEmail(this ClaimsPrincipal user)
    {
        var email = user.FindFirst(ClaimTypes.Email)?.Value
            ?? user.FindFirst(JwtRegisteredClaimNames.Email)?.Value;

        if (string.IsNullOrWhiteSpace(email))
            throw new UnauthorizedAccessException("Email claim is missing.");

        return email;
    }

    public static string GetUsername(this ClaimsPrincipal user)
    {
        var username = user.FindFirst(ClaimTypes.Name)?.Value
            ?? user.FindFirst(JwtRegisteredClaimNames.UniqueName)?.Value;

        if (string.IsNullOrWhiteSpace(username))
            throw new UnauthorizedAccessException("Username claim is missing.");

        return username;
    }
}