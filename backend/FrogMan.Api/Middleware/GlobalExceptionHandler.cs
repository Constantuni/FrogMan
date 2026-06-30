using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using FrogMan.Domain.Exceptions;

namespace FrogMan.Api.Middleware;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        // 1. Check if it's our new Validation Exception first
        if (exception is ValidationAppException validationEx)
        {
            var validationProblem = new HttpValidationProblemDetails(validationEx.Errors)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = validationEx.Message,
                Detail = "Please refer to the errors property for additional details."
            };

            httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            await httpContext.Response.WriteAsJsonAsync(validationProblem, cancellationToken);
            return true;
        }

        // 2. Handle standard AppExceptions (Conflict, Unauthorized, etc.)
        if (exception is AppException appException)
        {
            var problemDetails = new ProblemDetails
            {
                Status = (int)appException.StatusCode,
                Title = appException.StatusCode.ToString(),
                Detail = appException.Message 
            };

            httpContext.Response.StatusCode = (int)appException.StatusCode;
            await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
            return true;
        }

        // 3. Fallback for 500 Internal Server Errors
        logger.LogError(exception, "Unhandled exception occurred.");
        
        var serverErrorProblem = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "An unexpected error occurred.",
            Detail = "A server error prevented your request from being completed."
        };

        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await httpContext.Response.WriteAsJsonAsync(serverErrorProblem, cancellationToken);
        return true;
    }
}