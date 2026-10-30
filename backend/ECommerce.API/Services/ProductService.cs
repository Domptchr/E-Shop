using ECommerce.API.DTOs;
using ECommerce.API.Repositories;

namespace ECommerce.API.Services;

public class ProductService(IProductRepository products) : IProductService
{
    public async Task<List<ProductDto>> GetAllAsync() =>
        (await products.GetAllAsync()).Select(ProductDto.From).ToList();
}
