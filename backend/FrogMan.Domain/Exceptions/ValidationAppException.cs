// Domain/Exceptions/ValidationAppException.cs
using System.Net;

namespace FrogMan.Domain.Exceptions;

public class ValidationAppException : AppException
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationAppException(IDictionary<string, string[]> errors) 
        : base("One or more validation errors occurred.", HttpStatusCode.BadRequest)
    {
        Errors = errors;
    }
}