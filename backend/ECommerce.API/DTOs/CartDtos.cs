using System.ComponentModel.DataAnnotations;
using ECommerce.API.Models;

namespace ECommerce.API.DTOs;

public record CartItemDto(
    int ProductId,
    string ProductCode,
    string ProductName,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal,
    int AvailableQty)
{
    public static CartItemDto From(CartItem i) => new(
        i.ProductId,
        i.Product!.ProductCode,
        i.Product.ProductName,
        i.Product.UnitPrice,
        i.Quantity,
        i.Product.UnitPrice * i.Quantity,
        i.Product.AvailableQty);
}

public record CartDto(Guid Id, List<CartItemDto> Items, int TotalQuantity, decimal TotalAmount)
{
    public static CartDto From(Cart c)
    {
        var items = c.Items.Select(CartItemDto.From).ToList();
        return new(c.Id, items, items.Sum(i => i.Quantity), items.Sum(i => i.LineTotal));
    }
}

public record AddCartItemDto
{
    [Range(1, int.MaxValue, ErrorMessage = "กรุณาระบุสินค้า")]
    public int ProductId { get; init; }

    [Range(1, 9999, ErrorMessage = "จำนวนต้องอยู่ระหว่าง 1 - 9999")]
    public int Quantity { get; init; } = 1;
}

public record UpdateCartItemDto
{
    [Range(1, 9999, ErrorMessage = "จำนวนต้องอยู่ระหว่าง 1 - 9999")]
    public int Quantity { get; init; }
}
