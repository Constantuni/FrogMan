
using Microsoft.Extensions.DependencyInjection;
using FluentValidation;
using FluentValidation.AspNetCore;
using FrogMan.Application.Interfaces;
using FrogMan.Application.Interfaces.Auth;
using FrogMan.Application.Services;

namespace FrogMan.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Register Application Services
        services.AddScoped<IAuthService, AuthService>();
        // services.AddScoped<IProjectService, ProjectService>();

        // Register FluentValidation
        services.AddFluentValidationAutoValidation();
        services.AddValidatorsFromAssemblyContaining<IApplicationAssemblyMarker>();

        return services;
    }
}