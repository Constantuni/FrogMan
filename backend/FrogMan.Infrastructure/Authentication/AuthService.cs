using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FrogMan.Application.DTOs.Auth;
using FrogMan.Application.Interfaces;
using FrogMan.Application.Security;
using FrogMan.Domain.Entities;
using FrogMan.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

namespace FrogMan.Infrastructure.Authentication;

public class AuthService(ApplicationDbContext context, IConfiguration config) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        var username = request.Username.Trim();
        var email = request.Email.Trim();

        var emailExists = await context.Users
            .AnyAsync(u => u.Email == email, cancellationToken);

        if (emailExists)
            throw new InvalidOperationException("Email is already in use.");

        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = username,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            var workspace = new Workspace
            {
                Id = Guid.NewGuid(),
                Name = $"{username}'s Workspace",
                OwnerUserId = user.Id
            };

            var workspaceMember = new WorkspaceMember
            {
                Id = Guid.NewGuid(),
                WorkspaceId = workspace.Id,
                UserId = user.Id,
                Role = "Owner"
            };

            context.Users.Add(user);
            context.Workspaces.Add(workspace);
            context.WorkspaceMembers.Add(workspaceMember);

            await context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            var token = GenerateJwt(user);

            return new AuthResponse(
                token,
                new UserDto(user.Id, user.Username, user.Email)
            );
        }
        catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new InvalidOperationException("Email is already in use.");
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<AuthResponse?> LoginAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim();

        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return null;

        var token = GenerateJwt(user);

        return new AuthResponse(
            token,
            new UserDto(user.Id, user.Username, user.Email)
        );
    }

    private string GenerateJwt(User user)
    {
        var jwtSettings = config.GetSection("JwtSettings").Get<JwtSettings>()
            ?? throw new Exception("JwtSettings section is missing from configuration!");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, user.Username),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings.Issuer,
            audience: jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(jwtSettings.ExpiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException ex)
    {
        return ex.InnerException is PostgresException postgresEx &&
               postgresEx.SqlState == PostgresErrorCodes.UniqueViolation;
    }
}
