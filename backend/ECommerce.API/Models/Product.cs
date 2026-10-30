namespace ECommerce.API.Models;

public class Product
{
    public int Id { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }

    // Physical quantity in the warehouse; only checkout reduces it.
    public int StockQty { get; set; }

    // Quantity currently held in shopping carts.
    public int ReservedQty { get; set; }

    public int AvailableQty => StockQty - ReservedQty;
}
