using FluentValidation;
using FrogMan.Application.DTOs.Tasks;
using FrogMan.Domain.Constants;

namespace FrogMan.Application.Validators.Tasks;

public class CreateTaskRequestValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskRequestValidator()
    {
        RuleFor(x => x.Title)
            .Cascade(CascadeMode.Stop)
            .Must(x => !string.IsNullOrWhiteSpace(x))
            .WithMessage("Task title is required.")
            .Must(x => x == null || x.Trim().Length <= 200)
            .WithMessage("Task title must not exceed 200 characters.");

        RuleFor(x => x.Description)
            .Must(x => x == null || x.Trim().Length <= 2000)
            .WithMessage("Task description must not exceed 2000 characters.");

        RuleFor(x => x.Status)
            .Cascade(CascadeMode.Stop)
            .Must(x => !string.IsNullOrWhiteSpace(x))
            .WithMessage("Task status is required.")
            .Must(x => !string.IsNullOrWhiteSpace(x) && TaskStatuses.All.Contains(x.Trim()))
            .WithMessage("Invalid task status.");

        RuleFor(x => x.Priority)
            .Cascade(CascadeMode.Stop)
            .Must(x => !string.IsNullOrWhiteSpace(x))
            .WithMessage("Task priority is required.")
            .Must(x => !string.IsNullOrWhiteSpace(x) && TaskPriorities.All.Contains(x.Trim()))
            .WithMessage("Invalid task priority.");

        RuleFor(x => x.DueDate)
            .Must(d => !d.HasValue || d.Value.Kind == DateTimeKind.Utc)
            .WithMessage("DueDate must be a UTC datetime.");
    }
}