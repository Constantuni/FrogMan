using Microsoft.OpenApi;
using Microsoft.OpenApi.Models; // Added to ensure OpenApiInfo resolves
using FrogMan.Application;
using FrogMan.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// --- 1. ADD LAYERS ---
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// --- 2. API SPECIFIC SETUP ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        //policy.WithOrigins("http://localhost:5173")
        policy.AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .SetIsOriginAllowed(_ => true));
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// --- EXACT OLD SWAGGER SETUP ---
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

var port = Environment.GetEnvironmentVariable("PORT") ?? "10000";

builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var app = builder.Build();

// --- 3. HTTP PIPELINE ---
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", () => Results.Ok("Healthy"));

app.Run();

public partial class Program { }