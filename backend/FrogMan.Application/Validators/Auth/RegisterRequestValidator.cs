using FluentValidation;
using FrogMan.Application.DTOs.Auth;
using System.Text.RegularExpressions;

namespace FrogMan.Application.Validators.Auth;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    private static readonly Regex UsernameRegex =
        new(@"^[a-zA-Z0-9._-]+$", RegexOptions.Compiled);

    public RegisterRequestValidator()
    {
        RuleFor(x => x.Username)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .WithMessage("Username is required.")
            .Must(x => x.Trim().Length >= 3 && x.Trim().Length <= 30)
            .WithMessage("Username must be between 3 and 30 characters.")
            .Must(x => UsernameRegex.IsMatch(x.Trim()))
            .WithMessage("Username may contain letters, numbers, '.', '_' and '-' only.");

        RuleFor(x => x.Email)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .WithMessage("Email is required.")
            .MaximumLength(254)
            .WithMessage("Email is too long.")
            .EmailAddress()
            .WithMessage("Invalid email format.");

        RuleFor(x => x.Password)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .WithMessage("Password is required.")
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters.")
            .MaximumLength(128)
            .WithMessage("Password must not exceed 128 characters.")
            .Matches("[A-Z]")
            .WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[a-z]")
            .WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[0-9]")
            .WithMessage("Password must contain at least one number.");
    }
}
