using ECommerce.API.Models;

namespace ECommerce.API.Repositories;

public interface ICartRepository
{
    Task<Cart?> GetWithItemsAsync(Guid id);
    Task AddAsync(Cart cart);
    void RemoveItem(CartItem item);
    Task SaveChangesAsync();

    // Drops tracked entities so a retried operation reloads fresh data.
    void DiscardChanges();
}
