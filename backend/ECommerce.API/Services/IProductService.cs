using ECommerce.API.DTOs;

namespace ECommerce.API.Services;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync();
}
