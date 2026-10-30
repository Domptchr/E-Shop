using ECommerce.API.DTOs;
using ECommerce.API.Helpers;
using ECommerce.API.Models;
using ECommerce.API.Repositories;

namespace ECommerce.API.Services;

// Items in a cart reserve stock (Product.ReservedQty); the physical StockQty is only cut at checkout.
public class CartService(ICartRepository carts, IProductRepository products, TimeProvider clock) : ICartService
{
    public async Task<CartDto> CreateAsync()
    {
        var now = clock.GetUtcNow().UtcDateTime;
        var cart = new Cart { Id = Guid.NewGuid(), CreatedAt = now, UpdatedAt = now };
        await carts.AddAsync(cart);
        await carts.SaveChangesAsync();
        return CartDto.From(cart);
    }

    public async Task<CartDto> GetAsync(Guid cartId) =>
        CartDto.From(await LoadCartAsync(cartId));

    public Task<CartDto> AddItemAsync(Guid cartId, AddCartItemDto dto) =>
        ConcurrencyRetry.ExecuteAsync(async () =>
        {
            var cart = await LoadCartAsync(cartId);
            var product = await products.GetByIdAsync(dto.ProductId) ?? throw new NotFoundException("ไม่พบสินค้า");

            Reserve(product, dto.Quantity);

            var item = cart.Items.FirstOrDefault(i => i.ProductId == product.Id);
            if (item is null)
                cart.Items.Add(new CartItem { ProductId = product.Id, Product = product, Quantity = dto.Quantity });
            else
                item.Quantity += dto.Quantity;

            return await SaveAsync(cart);
        }, carts.DiscardChanges);

    public Task<CartDto> UpdateItemAsync(Guid cartId, int productId, UpdateCartItemDto dto) =>
        ConcurrencyRetry.ExecuteAsync(async () =>
        {
            var cart = await LoadCartAsync(cartId);
            var item = FindItem(cart, productId);

            var delta = dto.Quantity - item.Quantity;
            if (delta > 0)
                Reserve(item.Product!, delta);
            else
                Release(item.Product!, -delta);
            item.Quantity = dto.Quantity;

            return await SaveAsync(cart);
        }, carts.DiscardChanges);

    public Task<CartDto> RemoveItemAsync(Guid cartId, int productId) =>
        ConcurrencyRetry.ExecuteAsync(async () =>
        {
            var cart = await LoadCartAsync(cartId);
            RemoveItem(cart, FindItem(cart, productId));
            return await SaveAsync(cart);
        }, carts.DiscardChanges);

    public Task<CartDto> ClearAsync(Guid cartId) =>
        ConcurrencyRetry.ExecuteAsync(async () =>
        {
            var cart = await LoadCartAsync(cartId);
            foreach (var item in cart.Items.ToList())
                RemoveItem(cart, item);
            return await SaveAsync(cart);
        }, carts.DiscardChanges);

    private void RemoveItem(Cart cart, CartItem item)
    {
        Release(item.Product!, item.Quantity);
        cart.Items.Remove(item);
        carts.RemoveItem(item);
    }

    private static void Reserve(Product product, int quantity)
    {
        if (product.AvailableQty < quantity)
            throw new InsufficientStockException(product.ProductName, product.AvailableQty);
        product.ReservedQty += quantity;
    }

    private static void Release(Product product, int quantity) =>
        product.ReservedQty = Math.Max(0, product.ReservedQty - quantity);

    private async Task<CartDto> SaveAsync(Cart cart)
    {
        cart.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        await carts.SaveChangesAsync();
        return CartDto.From(cart);
    }

    private async Task<Cart> LoadCartAsync(Guid cartId) =>
        await carts.GetWithItemsAsync(cartId) ?? throw new NotFoundException("ไม่พบตะกร้าสินค้า");

    private static CartItem FindItem(Cart cart, int productId) =>
        cart.Items.FirstOrDefault(i => i.ProductId == productId)
        ?? throw new NotFoundException("ไม่พบสินค้านี้ในตะกร้า");
}
