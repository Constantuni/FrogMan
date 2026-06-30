using System.Net;

namespace FrogMan.Domain.Exceptions;

public class NotFoundException(string message) 
    : AppException(message, HttpStatusCode.NotFound);