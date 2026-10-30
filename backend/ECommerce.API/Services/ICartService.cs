using ECommerce.API.DTOs;

namespace ECommerce.API.Services;

public interface ICartService
{
    Task<CartDto> CreateAsync();
    Task<CartDto> GetAsync(Guid cartId);
    Task<CartDto> AddItemAsync(Guid cartId, AddCartItemDto dto);
    Task<CartDto> UpdateItemAsync(Guid cartId, int productId, UpdateCartItemDto dto);
    Task<CartDto> RemoveItemAsync(Guid cartId, int productId);
    Task<CartDto> ClearAsync(Guid cartId);
}
