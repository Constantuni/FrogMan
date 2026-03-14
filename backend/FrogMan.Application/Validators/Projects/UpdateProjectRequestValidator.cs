using FluentValidation;
using FrogMan.Application.DTOs.Projects;

namespace FrogMan.Application.Validators.Projects;

public class UpdateProjectRequestValidator : AbstractValidator<UpdateProjectRequest>
{
    public UpdateProjectRequestValidator()
    {
        RuleFor(x => x.Name)
            .Cascade(CascadeMode.Stop)
            .Must(x => !string.IsNullOrWhiteSpace(x))
            .WithMessage("Project name is required.")
            .Must(x => x == null || x.Trim().Length <= 150)
            .WithMessage("Project name must not exceed 150 characters.");

        RuleFor(x => x.Description)
            .Must(x => x == null || x.Trim().Length <= 2000)
            .WithMessage("Project description must not exceed 2000 characters.");
    }
}
