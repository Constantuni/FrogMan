using FrogMan.Domain.Entities;

namespace FrogMan.Application.Interfaces.Security;

public interface ITokenGenerator
{
    string GenerateToken(User user);
}
