namespace ECommerce.API.Helpers;

// Thrown by services; translated to HTTP status codes by ExceptionMiddleware.
public abstract class AppException(string message, int statusCode) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}

public class BadRequestException(string message) : AppException(message, StatusCodes.Status400BadRequest);

public class NotFoundException(string message) : AppException(message, StatusCodes.Status404NotFound);

public class ConflictException(string message) : AppException(message, StatusCodes.Status409Conflict);

public class InsufficientStockException(string productName, int availableQty)
    : ConflictException($"สินค้า {productName} คงเหลือไม่เพียงพอ (เหลือ {availableQty} ชิ้น)");
