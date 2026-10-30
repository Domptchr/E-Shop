using ECommerce.API.Models;

namespace ECommerce.API.Data;

// Mock product master data, inserted by the InitialCreate migration (no product API by design).
public static class ProductSeed
{
    public static readonly Product[] Products =
    [
        new() { Id = 1, ProductCode = "P001", ProductName = "เมาส์ไร้สาย (Wireless Mouse)", UnitPrice = 590m, StockQty = 50 },
        new() { Id = 2, ProductCode = "P002", ProductName = "คีย์บอร์ด Mechanical", UnitPrice = 2490m, StockQty = 20 },
        new() { Id = 3, ProductCode = "P003", ProductName = "จอมอนิเตอร์ 27 นิ้ว", UnitPrice = 6990m, StockQty = 8 },
        new() { Id = 4, ProductCode = "P004", ProductName = "หูฟังบลูทูธ", UnitPrice = 1290m, StockQty = 30 },
        new() { Id = 5, ProductCode = "P005", ProductName = "แฟลชไดรฟ์ USB 64GB", UnitPrice = 249m, StockQty = 100 },
        new() { Id = 6, ProductCode = "P006", ProductName = "SSD External 1TB", UnitPrice = 3290m, StockQty = 12 },
        new() { Id = 7, ProductCode = "P007", ProductName = "เว็บแคม Full HD", UnitPrice = 1590m, StockQty = 5 },
        new() { Id = 8, ProductCode = "P008", ProductName = "แท่นชาร์จไร้สาย", UnitPrice = 790m, StockQty = 25 },
        new() { Id = 9, ProductCode = "P009", ProductName = "สาย USB-C to USB-C 1m", UnitPrice = 199m, StockQty = 3 },
        new() { Id = 10, ProductCode = "P010", ProductName = "ลำโพงบลูทูธพกพา", UnitPrice = 1890m, StockQty = 15 },
        new() { Id = 11, ProductCode = "P011", ProductName = "แผ่นรองเมาส์ขนาดใหญ่", UnitPrice = 350m, StockQty = 40 },
        new() { Id = 12, ProductCode = "P012", ProductName = "ขาตั้งโน้ตบุ๊ก", UnitPrice = 890m, StockQty = 0 },
    ];
}
