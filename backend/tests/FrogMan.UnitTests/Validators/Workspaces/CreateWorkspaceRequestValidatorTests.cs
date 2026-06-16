using FluentValidation.TestHelper;
using FrogMan.Application.DTOs.Workspaces;
using FrogMan.Application.Validators.Workspaces;

namespace FrogMan.UnitTests.Validators.Workspaces;

public class CreateWorkspaceRequestValidatorTests
{
    private readonly CreateWorkspaceRequestValidator _validator = new();

    [Fact]
    public void Should_Have_Error_When_Name_Is_Empty()
    {
        var model = new CreateWorkspaceRequest
        {
            Name = string.Empty
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Have_Error_When_Name_Is_Too_Long()
    {
        var model = new CreateWorkspaceRequest
        {
            Name = new string('a', 151)
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Not_Have_Error_When_Name_Is_Valid()
    {
        var model = new CreateWorkspaceRequest
        {
            Name = "Frog Workspace"
        };

        var result = _validator.TestValidate(model);

        result.ShouldNotHaveValidationErrorFor(x => x.Name);
    }
}