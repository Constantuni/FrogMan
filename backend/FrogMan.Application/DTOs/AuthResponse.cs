namespace FrogMan.Application.DTOs;

public record UserDto(Guid Id, string Username, string Email);

public record AuthResponse(string Token, UserDto User);