using ECommerce.API.Data;
using ECommerce.API.DTOs;
using ECommerce.API.Helpers;
using ECommerce.API.Models;
using ECommerce.API.Repositories;
using ECommerce.API.Services;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Tests;

public class CartServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly CartService _service;
    private readonly Product _mouse;
    private readonly Product _cable;

    public CartServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);

        _mouse = new Product { Id = 101, ProductCode = "T001", ProductName = "Mouse", UnitPrice = 100m, StockQty = 10 };
        _cable = new Product { Id = 102, ProductCode = "T002", ProductName = "Cable", UnitPrice = 50m, StockQty = 3 };
        _db.Products.AddRange(_mouse, _cable);
        _db.SaveChanges();

        _service = new CartService(new CartRepository(_db), new ProductRepository(_db), TimeProvider.System);
    }

    public void Dispose() => _db.Dispose();

    private async Task<Product> ReloadAsync(int id)
    {
        _db.ChangeTracker.Clear();
        return await _db.Products.SingleAsync(p => p.Id == id);
    }

    [Fact]
    public async Task AddItem_ReservesStock_AndComputesTotal()
    {
        var cart = await _service.CreateAsync();

        var result = await _service.AddItemAsync(cart.Id, new AddCartItemDto { ProductId = _mouse.Id, Quantity = 3 });

        Assert.Equal(3, result.TotalQuantity);
        Assert.Equal(300m, result.TotalAmount);
        var mouse = await ReloadAsync(_mouse.Id);
        Assert.Equal(10, mouse.StockQty);
        Assert.Equal(3, mouse.ReservedQty);
    }

    [Fact]
    public async Task AddItem_SameProductTwice_MergesQuantity()
    {
        var cart = await _service.CreateAsync();
        await _service.AddItemAsync(cart.Id, new AddCartItemDto { ProductId = _mouse.Id, Quantity = 2 });

        var result = await _service.AddItemAsync(cart.Id, new AddCartItemDto { ProductId = _mouse.Id, Quantity = 4 });

        Assert.Single(result.Items);
        Assert.Equal(6, result.Items[0].Quantity);
        Assert.Equal(6, (await ReloadAsync(_mouse.Id)).ReservedQty);
    }

    [Fact]
    public async Task AddItem_MoreThanAvailable_ThrowsAndKeepsStock()
    {
        var cart = await _service.CreateAsync();
        await _service.AddItemAsync(cart.Id, new AddCartItemDto { ProductId = _cable.Id, Quantity = 2 });

        var ex = await Assert.ThrowsAsync<InsufficientStockException>(() =>
            _service.AddItemAsync(cart.Id, new AddCartItemDto { ProductId = _cable.Id, Quantity = 2 }));

        Assert.Contains("เหลือ 1 ชิ้น", ex.Message);
        Assert.Equal(2, (await ReloadAsync(_cable.Id)).ReservedQty);
    }

    [Fact]
    public async Task AddItem_ReservedByAnotherCart_IsNotAvailable()
    {
        var first = await _service.CreateAsync();
        var second = await _service.CreateAsync();
        await _service.AddItemAsync(first.Id, new AddCartItemDto { ProductId = _cable.Id, Quantity = 3 });

        await Assert.ThrowsAsync<InsufficientStockException>(() =>
            _service.AddItemAsync(second.Id, new AddCartItemDto { ProductId = _cable.Id, Quantity = 1 }));
    }

    [Fact]
    public async Task UpdateItem_IncreaseAndDecrease_AdjustsReservation()
    {
        var cart = await _service.CreateAsync();
        await _service.AddItemAsync(cart.Id, new AddCartItemDto { ProductId = _mouse.Id, Quantity = 2 });

        await _service.UpdateItemAsync(cart.Id, _mouse.Id, new UpdateCartItemDto { Quantity = 5 });
        Assert.Equal(5, (await ReloadAsync(_mouse.Id)).ReservedQty);

        var result = await _service.UpdateItemAsync(cart.Id, _mouse.Id, new UpdateCartItemDto { Quantity = 1 });
        Assert.Equal(1, result.Items[0].Quantity);
        Assert.Equal(1, (await ReloadAsync(_mouse.Id)).ReservedQty);
    }

    [Fact]
    public async Task UpdateItem_AboveAvailable_Throws()
    {
        var cart = await _service.CreateAsync();
        await _service.AddItemAsync(cart.Id, new AddCartItemDto { ProductId = _cable.Id, Quantity = 1 });

        await Assert.ThrowsAsync<InsufficientStockException>(() =>
            _service.UpdateItemAsync(cart.Id, _cable.Id, new UpdateCartItemDto { Quantity = 4 }));
        Assert.Equal(1, (await ReloadAsync(_cable.Id)).ReservedQty);
    }

    [Fact]
    public async Task RemoveItem_ReleasesReservation()
    {
        var cart = await _service.CreateAsync();
        await _service.AddItemAsync(cart.Id, new AddCartItemDto { ProductId = _mouse.Id, Quantity = 4 });
        await _service.AddItemAsync(cart.Id, new AddCartItemDto { ProductId = _cable.Id, Quantity = 1 });

        var result = await _service.RemoveItemAsync(cart.Id, _mouse.Id);

        Assert.Single(result.Items);
        Assert.Equal(0, (await ReloadAsync(_mouse.Id)).ReservedQty);
        Assert.Equal(1, (await ReloadAsync(_cable.Id)).ReservedQty);
    }

    [Fact]
    public async Task Clear_ReleasesAllReservations()
    {
        var cart = await _service.CreateAsync();
        await _service.AddItemAsync(cart.Id, new AddCartItemDto { ProductId = _mouse.Id, Quantity = 4 });
        await _service.AddItemAsync(cart.Id, new AddCartItemDto { ProductId = _cable.Id, Quantity = 3 });

        var result = await _service.ClearAsync(cart.Id);

        Assert.Empty(result.Items);
        Assert.Equal(0m, result.TotalAmount);
        Assert.Equal(0, (await ReloadAsync(_mouse.Id)).ReservedQty);
        Assert.Equal(0, (await ReloadAsync(_cable.Id)).ReservedQty);
        Assert.Empty(_db.CartItems);
    }

    [Fact]
    public async Task UnknownCart_ThrowsNotFound()
    {
        await Assert.ThrowsAsync<NotFoundException>(() => _service.GetAsync(Guid.NewGuid()));
    }
}
