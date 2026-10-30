using ECommerce.API.DTOs;
using ECommerce.API.Helpers;
using ECommerce.API.Models;
using ECommerce.API.Repositories;

namespace ECommerce.API.Services;

public class OrderService(ICartRepository carts, IOrderRepository orders, TimeProvider clock) : IOrderService
{
    // Cuts the physical stock, releases the cart's reservation, records the order and empties the cart.
    // Everything is persisted by a single SaveChanges, so it succeeds or fails as one unit.
    public Task<OrderDto> CheckoutAsync(Guid cartId) =>
        ConcurrencyRetry.ExecuteAsync(async () =>
        {
            var cart = await carts.GetWithItemsAsync(cartId) ?? throw new NotFoundException("ไม่พบตะกร้าสินค้า");
            if (cart.Items.Count == 0)
                throw new BadRequestException("ไม่มีสินค้าในตะกร้า");

            var now = clock.GetUtcNow().UtcDateTime;
            var order = new Order
            {
                OrderNo = $"ORD-{now:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 10000)}",
                CreatedAt = now,
            };

            foreach (var item in cart.Items.ToList())
            {
                var product = item.Product!;
                // Reserved stock is always <= StockQty, so this can only fail if data was corrupted.
                if (product.StockQty < item.Quantity || product.ReservedQty < item.Quantity)
                    throw new InsufficientStockException(product.ProductName, product.StockQty);

                product.StockQty -= item.Quantity;
                product.ReservedQty -= item.Quantity;

                order.Items.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductCode = product.ProductCode,
                    ProductName = product.ProductName,
                    UnitPrice = product.UnitPrice,
                    Quantity = item.Quantity,
                    LineTotal = product.UnitPrice * item.Quantity,
                });

                cart.Items.Remove(item);
                carts.RemoveItem(item);
            }

            order.TotalAmount = order.Items.Sum(i => i.LineTotal);
            cart.UpdatedAt = now;
            await orders.AddAsync(order);
            await carts.SaveChangesAsync();
            return OrderDto.From(order);
        }, carts.DiscardChanges);

    public async Task<OrderDto> GetByIdAsync(int id) =>
        OrderDto.From(await orders.GetWithItemsAsync(id) ?? throw new NotFoundException("ไม่พบคำสั่งซื้อ"));
}
