using ECommerce.API.Data;
using ECommerce.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Repositories;

public class CartRepository(AppDbContext db) : ICartRepository
{
    public Task<Cart?> GetWithItemsAsync(Guid id) =>
        db.Carts
            .Include(c => c.Items.OrderBy(i => i.Id))
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task AddAsync(Cart cart) => await db.Carts.AddAsync(cart);

    public void RemoveItem(CartItem item) => db.CartItems.Remove(item);

    public Task SaveChangesAsync() => db.SaveChangesAsync();

    public void DiscardChanges() => db.ChangeTracker.Clear();
}
