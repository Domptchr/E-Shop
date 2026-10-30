using ECommerce.API.DTOs;

namespace ECommerce.API.Services;

public interface IOrderService
{
    Task<OrderDto> CheckoutAsync(Guid cartId);
    Task<OrderDto> GetByIdAsync(int id);
}
