using ECommerce.API.Models;

namespace ECommerce.API.Repositories;

public interface IOrderRepository
{
    Task<Order?> GetWithItemsAsync(int id);
    Task AddAsync(Order order);
}
