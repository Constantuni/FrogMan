using Microsoft.AspNetCore.Mvc;
using FrogMan.Application.DTOs.Auth;
using FrogMan.Application.Interfaces;
using FrogMan.Application.Interfaces.Auth;

namespace FrogMan.Api.Controllers;

[ApiController]
[Route("api")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("auth/register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        // If authService throws InvalidOperationException, 
        // the GlobalExceptionHandler catches it and returns the standard 409 JSON.
        var result = await authService.RegisterAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpPost("auth/login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(
            request.Email,
            request.Password,
            cancellationToken);

        if (result is null)
        {
            // Built-in Problem() method to generate standard RFC 7807 JSON
            return Problem(
                title: "Unauthorized",
                detail: "Invalid email or password.",
                statusCode: StatusCodes.Status401Unauthorized
            );
        }

        return Ok(result);
    }
}
