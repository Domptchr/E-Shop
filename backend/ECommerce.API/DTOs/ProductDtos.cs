using ECommerce.API.Models;

namespace ECommerce.API.DTOs;

public record ProductDto(
    int Id,
    string ProductCode,
    string ProductName,
    decimal UnitPrice,
    int StockQty,
    int ReservedQty,
    int AvailableQty)
{
    public static ProductDto From(Product p) =>
        new(p.Id, p.ProductCode, p.ProductName, p.UnitPrice, p.StockQty, p.ReservedQty, p.AvailableQty);
}
