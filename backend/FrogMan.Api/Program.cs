// backend/FrogMan.Api/Program.cs
using Microsoft.OpenApi;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.HttpOverrides;
using FrogMan.Application;
using FrogMan.Infrastructure;
using FrogMan.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ADD LAYERS
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// API SPECIFIC SETUP
var frontendUrls = builder.Configuration["FrontendUrls"]?.Split(',') 
                   ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        policy.AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithOrigins(frontendUrls));
});

// ADD CONTROLLERS
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();


// GLOBAL EXCEPTION HANDLER SETUP
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// SWAGGER SETUP
builder.Services.AddSwaggerGen(options =>
{
    const string schemeId = "Bearer";

    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FrogMan API",
        Version = "v1"
    });

    options.AddSecurityDefinition(schemeId, new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste only the JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = schemeId
                    }
                },
                Array.Empty<string>()
            }
        });
});

// PORT SETUP
var port = Environment.GetEnvironmentVariable("PORT") ?? "10000";

builder.WebHost.UseUrls($"http://0.0.0.0:{port}"); // FIXXX

var app = builder.Build();

// Trust the headers sent by Render's load balancer
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedProto
});

// GLOBAL EXCEPTION HANDLER
app.UseExceptionHandler();

// HTTP PIPELINE
app.UseSwagger();
app.UseSwaggerUI();

// CORS
app.UseCors("AllowReactApp");

// AUTHENTICATION & AUTHORIZATION
app.UseAuthentication();
app.UseAuthorization();

// ROUTES
app.MapControllers();
app.MapGet("/health", () => Results.Ok("Healthy"));

app.Run();

public partial class Program { }