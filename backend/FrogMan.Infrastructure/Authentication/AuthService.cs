using System.Security.Claims;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using FrogMan.Application.Interfaces;
using FrogMan.Infrastructure.Persistence;
using FrogMan.Domain.Entities;
using FrogMan.Application.Security;
using FrogMan.Application.DTOs;

namespace FrogMan.Infrastructure.Authentication;

public class AuthService(ApplicationDbContext context, IConfiguration config) : IAuthService 
{
    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        var user = new User {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        var token = GenerateJwt(user);
        return new AuthResponse(token, user.Username, user.Email);
    }

    public async Task<AuthResponse?> LoginAsync(string email, string password)
    {
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return null;
        }

        var token = GenerateJwt(user);
        return new AuthResponse(token, user.Username, user.Email);
    }

    private string GenerateJwt(User user)
    {
        var jwtSettings = config.GetSection("JwtSettings").Get<JwtSettings>()
            ?? throw new Exception("JwtSettings section is missing from configuration!");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new (JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new (JwtRegisteredClaimNames.UniqueName, user.Username),
            new (JwtRegisteredClaimNames.Email, user.Email),
            new (JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
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
}