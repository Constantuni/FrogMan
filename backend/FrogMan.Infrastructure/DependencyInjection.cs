using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using FrogMan.Application.Interfaces;
using FrogMan.Application.Interfaces.Repositories;
using FrogMan.Application.Interfaces.Security;
using FrogMan.Infrastructure.Persistence;
using FrogMan.Infrastructure.Security;
using FrogMan.Infrastructure.Repositories;

namespace FrogMan.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Database Context
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"),
                npgsqlOptions =>
                {
                    npgsqlOptions.CommandTimeout((int)TimeSpan.FromMinutes(3).TotalSeconds);                
                }
            )
        );

        // 2. Repositories & Unit of Work
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IWorkspaceRepository, WorkspaceRepository>();
        // services.AddScoped<IProjectRepository, ProjectRepository>(); // Add others here later
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // 3. Security (Hasher and Token Generator)
        services.AddSingleton<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<ITokenGenerator, JwtTokenGenerator>();

        // 4. JWT Configuration & Authentication Middleware
        var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>()
            ?? throw new Exception("JwtSettings section is missing from configuration!");

        if (string.IsNullOrWhiteSpace(jwtSettings.Secret))
            throw new Exception("JWT Secret is missing!");

        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret))
                };
            });

        services.AddAuthorization();

        return services;
    }
}