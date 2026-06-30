using System.Net;

namespace FrogMan.Domain.Exceptions;

public class ConflictException(string message) 
    : AppException(message, HttpStatusCode.Conflict);