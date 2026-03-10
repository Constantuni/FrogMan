using FrogMan.Application.DTOs;

namespace FrogMan.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> LoginAsync(string email, string password);
}