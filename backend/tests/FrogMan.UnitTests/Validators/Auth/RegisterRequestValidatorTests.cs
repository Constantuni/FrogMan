using FluentValidation.TestHelper;
using FrogMan.Application.DTOs.Auth;
using FrogMan.Application.Validators.Auth;

namespace FrogMan.UnitTests.Validators.Auth;

public class RegisterRequestValidatorTests
{
    private readonly RegisterRequestValidator _validator = new();

    [Fact]
    public void Should_Have_Error_When_Username_Is_Empty()
    {
        var model = new RegisterRequest
        {
            Username = string.Empty,
            Email = "test@example.com",
            Password = "StrongPass123!"
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Username);
    }

    [Fact]
    public void Should_Have_Error_When_Email_Is_Invalid()
    {
        var model = new RegisterRequest
        {
            Username = "frogman",
            Email = "bad-email",
            Password = "StrongPass123!"
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_Have_Error_When_Password_Is_Empty()
    {
        var model = new RegisterRequest
        {
            Username = "frogman",
            Email = "test@example.com",
            Password = string.Empty
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_Not_Have_Error_When_Request_Is_Valid()
    {
        var model = new RegisterRequest
        {
            Username = "frogman",
            Email = "test@example.com",
            Password = "StrongPass123!"
        };

        var result = _validator.TestValidate(model);

        result.ShouldNotHaveAnyValidationErrors();
    }
}