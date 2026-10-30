using ECommerce.API.Data;
using ECommerce.API.DTOs;
using ECommerce.API.Helpers;
using ECommerce.API.Models;
using ECommerce.API.Repositories;
using ECommerce.API.Services;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Tests;

public class OrderServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly CartService _carts;
    private readonly OrderService _service;
    private readonly Product _mouse;
    private readonly Product _cable;

    public OrderServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);

        _mouse = new Product { Id = 101, ProductCode = "T001", ProductName = "Mouse", UnitPrice = 100m, StockQty = 10 };
        _cable = new Product { Id = 102, ProductCode = "T002", ProductName = "Cable", UnitPrice = 50m, StockQty = 3 };
        _db.Products.AddRange(_mouse, _cable);
        _db.SaveChanges();

        var cartRepository = new CartRepository(_db);
        _carts = new CartService(cartRepository, new ProductRepository(_db), TimeProvider.System);
        _service = new OrderService(cartRepository, new OrderRepository(_db), TimeProvider.System);
    }

    public void Dispose() => _db.Dispose();

    private async Task<Product> ReloadAsync(int id)
    {
        _db.ChangeTracker.Clear();
        return await _db.Products.SingleAsync(p => p.Id == id);
    }

    [Fact]
    public async Task Checkout_CutsStock_ReleasesReservation_AndEmptiesCart()
    {
        var cart = await _carts.CreateAsync();
        await _carts.AddItemAsync(cart.Id, new AddCartItemDto { ProductId = _mouse.Id, Quantity = 3 });
        await _carts.AddItemAsync(cart.Id, new AddCartItemDto { ProductId = _cable.Id, Quantity = 3 });

        var order = await _service.CheckoutAsync(cart.Id);

        Assert.Equal(450m, order.TotalAmount);
        Assert.Equal(6, order.TotalQuantity);
        Assert.Equal(2, order.Items.Count);

        var mouse = await ReloadAsync(_mouse.Id);
        Assert.Equal(7, mouse.StockQty);
        Assert.Equal(0, mouse.ReservedQty);
        var cable = await ReloadAsync(_cable.Id);
        Assert.Equal(0, cable.StockQty);
        Assert.Equal(0, cable.ReservedQty);

        Assert.Empty((await _carts.GetAsync(cart.Id)).Items);
        Assert.Equal(450m, (await _service.GetByIdAsync(order.Id)).TotalAmount);
    }

    [Fact]
    public async Task Checkout_DoesNotTouchOtherCartsReservation()
    {
        var mine = await _carts.CreateAsync();
        var other = await _carts.CreateAsync();
        await _carts.AddItemAsync(mine.Id, new AddCartItemDto { ProductId = _mouse.Id, Quantity = 2 });
        await _carts.AddItemAsync(other.Id, new AddCartItemDto { ProductId = _mouse.Id, Quantity = 5 });

        await _service.CheckoutAsync(mine.Id);

        var mouse = await ReloadAsync(_mouse.Id);
        Assert.Equal(8, mouse.StockQty);
        Assert.Equal(5, mouse.ReservedQty);
        Assert.Equal(3, mouse.AvailableQty);
    }

    [Fact]
    public async Task Checkout_EmptyCart_Throws()
    {
        var cart = await _carts.CreateAsync();

        await Assert.ThrowsAsync<BadRequestException>(() => _service.CheckoutAsync(cart.Id));
        Assert.Empty(_db.Orders);
    }
}
