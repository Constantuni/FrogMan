using FluentValidation.TestHelper;
using FrogMan.Application.DTOs.Tasks;
using FrogMan.Application.Validators.Tasks;

namespace FrogMan.UnitTests.Validators.Tasks;

public class CreateTaskRequestValidatorTests
{
    private readonly CreateTaskRequestValidator _validator = new();

    [Fact]
    public void Should_Have_Error_When_Title_Is_Empty()
    {
        var model = new CreateTaskRequest
        {
            Title = string.Empty,
            Status = "ToDo",
            Priority = "Medium"
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public void Should_Have_Error_When_Status_Is_Invalid()
    {
        var model = new CreateTaskRequest
        {
            Title = "Build API tests",
            Status = "WrongStatus",
            Priority = "Medium"
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Status);
    }

    [Fact]
    public void Should_Have_Error_When_Priority_Is_Invalid()
    {
        var model = new CreateTaskRequest
        {
            Title = "Build API tests",
            Status = "ToDo",
            Priority = "WrongPriority"
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Priority);
    }

    [Fact]
    public void Should_Not_Have_Error_When_Request_Is_Valid()
    {
        var model = new CreateTaskRequest
        {
            Title = "Build API tests",
            Description = "Add validator test coverage",
            Status = "ToDo",
            Priority = "High",
            AssignedToUserId = null,
            DueDate = null
        };

        var result = _validator.TestValidate(model);

        result.ShouldNotHaveAnyValidationErrors();
    }
}