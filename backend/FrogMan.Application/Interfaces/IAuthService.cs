using FrogMan.Application.DTOs.Auth;

namespace FrogMan.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse?> LoginAsync(string email, string password, CancellationToken cancellationToken = default);
}
