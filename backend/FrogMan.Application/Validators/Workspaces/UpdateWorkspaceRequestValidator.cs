using FluentValidation;
using FrogMan.Application.DTOs.Workspaces;

namespace FrogMan.Application.Validators.Workspaces;

public class UpdateWorkspaceRequestValidator : AbstractValidator<UpdateWorkspaceRequest>
{
    public UpdateWorkspaceRequestValidator()
    {
        RuleFor(x => x.Name)
            .Cascade(CascadeMode.Stop)
            .Must(x => !string.IsNullOrWhiteSpace(x))
            .WithMessage("Workspace name is required.")
            .Must(x => x == null || x.Trim().Length <= 150)
            .WithMessage("Workspace name must not exceed 150 characters.");
    }
}
