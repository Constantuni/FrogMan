using FrogMan.Application.DTOs.Auth;
using FrogMan.Application.Interfaces.Services;
using FrogMan.Application.Interfaces.Repositories;
using FrogMan.Application.Interfaces.Security;
using FrogMan.Domain.Exceptions;
using FrogMan.Domain.Entities;
using FrogMan.Domain.Constants;

namespace FrogMan.Application.Services;

public class AuthService(
    IUserRepository userRepository,
    IWorkspaceRepository workspaceRepository,
    IUnitOfWork unitOfWork,
    IPasswordHasher passwordHasher,
    ITokenGenerator tokenGenerator) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(
        RegisterRequest request, 
        CancellationToken cancellationToken = default)
    {
        var username = request.Username.Trim();
        var email = request.Email.Trim();

        // 1. Check Business Rule
        if (await userRepository.ExistsAsync(email, cancellationToken))
            throw new ConflictException("Email is already in use.");

        // 2. Hash Password
        var passwordHash = passwordHasher.Hash(request.Password);

        // 3. Create Entities
        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            Email = email,
            PasswordHash = passwordHash
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
            Role = WorkspaceRoles.Owner
        };

        // 4. Save Data (Unit of Work guarantees atomicity)
        await userRepository.AddAsync(user, cancellationToken);
        await workspaceRepository.AddAsync(workspace, cancellationToken);
        await workspaceRepository.AddMemberAsync(workspaceMember, cancellationToken);
        
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // 5. Generate Token
        var token = tokenGenerator.GenerateToken(user);

        return new AuthResponse(token, new UserDto(user.Id, user.Username, user.Email));
    }

    public async Task<AuthResponse?> LoginAsync(
        string email, 
        string password, 
        CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim();

        var user = await userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (user is null || !passwordHasher.Verify(password, user.PasswordHash))
            throw new UnauthorizedException("Invalid email or password.");

        var token = tokenGenerator.GenerateToken(user);

        return new AuthResponse(token, new UserDto(user.Id, user.Username, user.Email));
    }
}