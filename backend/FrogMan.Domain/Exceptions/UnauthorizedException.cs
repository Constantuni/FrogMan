using System.Net;

namespace FrogMan.Domain.Exceptions;

public class UnauthorizedException(string message) 
    : AppException(message, HttpStatusCode.Unauthorized);