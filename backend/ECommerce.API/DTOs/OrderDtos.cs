using ECommerce.API.Models;

namespace ECommerce.API.DTOs;

public record OrderItemDto(int ProductId, string ProductCode, string ProductName, decimal UnitPrice, int Quantity, decimal LineTotal)
{
    public static OrderItemDto From(OrderItem i) =>
        new(i.ProductId, i.ProductCode, i.ProductName, i.UnitPrice, i.Quantity, i.LineTotal);
}

public record OrderDto(int Id, string OrderNo, DateTime CreatedAt, List<OrderItemDto> Items, int TotalQuantity, decimal TotalAmount)
{
    public static OrderDto From(Order o) => new(
        o.Id,
        o.OrderNo,
        o.CreatedAt,
        o.Items.Select(OrderItemDto.From).ToList(),
        o.Items.Sum(i => i.Quantity),
        o.TotalAmount);
}
