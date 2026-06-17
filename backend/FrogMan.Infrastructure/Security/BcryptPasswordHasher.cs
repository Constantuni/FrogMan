using FrogMan.Application.Interfaces;

namespace FrogMan.Infrastructure.Security;

public class BcryptPasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        // Generates a salt and hashes the password automatically
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool Verify(string password, string hash)
    {
        // Compares the plain text password against the stored hash
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}