using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using FrogMan.Application.Interfaces;
using FrogMan.Application.DTOs;

namespace FrogMan.Api.Controllers;

[ApiController]
[Route("api/[controller]")]

public class AuthController(IAuthService authService) : ControllerBase
{
    private readonly IAuthService _authService = authService;

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _authService.LoginAsync(request.Email, request.Password);
        
        if (result == null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }
        return Ok(result);
    }
}