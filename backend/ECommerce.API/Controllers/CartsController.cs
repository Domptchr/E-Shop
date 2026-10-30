using ECommerce.API.DTOs;
using ECommerce.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/carts")]
public class CartsController(ICartService service, IOrderService orderService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ApiResponse<CartDto>>> Create() =>
        Ok(ApiResponse<CartDto>.Ok(await service.CreateAsync()));

    [HttpGet("{cartId:guid}")]
    public async Task<ActionResult<ApiResponse<CartDto>>> Get(Guid cartId) =>
        Ok(ApiResponse<CartDto>.Ok(await service.GetAsync(cartId)));

    [HttpPost("{cartId:guid}/items")]
    public async Task<ActionResult<ApiResponse<CartDto>>> AddItem(Guid cartId, AddCartItemDto dto) =>
        Ok(ApiResponse<CartDto>.Ok(await service.AddItemAsync(cartId, dto), "เพิ่มสินค้าลงตะกร้าแล้ว"));

    [HttpPatch("{cartId:guid}/items/{productId:int}")]
    public async Task<ActionResult<ApiResponse<CartDto>>> UpdateItem(Guid cartId, int productId, UpdateCartItemDto dto) =>
        Ok(ApiResponse<CartDto>.Ok(await service.UpdateItemAsync(cartId, productId, dto)));

    [HttpDelete("{cartId:guid}/items/{productId:int}")]
    public async Task<ActionResult<ApiResponse<CartDto>>> RemoveItem(Guid cartId, int productId) =>
        Ok(ApiResponse<CartDto>.Ok(await service.RemoveItemAsync(cartId, productId), "ลบสินค้าออกจากตะกร้าแล้ว"));

    [HttpDelete("{cartId:guid}/items")]
    public async Task<ActionResult<ApiResponse<CartDto>>> Clear(Guid cartId) =>
        Ok(ApiResponse<CartDto>.Ok(await service.ClearAsync(cartId), "ล้างตะกร้าแล้ว"));

    [HttpPost("{cartId:guid}/checkout")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> Checkout(Guid cartId) =>
        Ok(ApiResponse<OrderDto>.Ok(await orderService.CheckoutAsync(cartId), "ชำระเงินสำเร็จ"));
}
