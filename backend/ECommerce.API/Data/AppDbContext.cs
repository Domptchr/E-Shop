using ECommerce.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable(t =>
            {
                t.HasCheckConstraint("CK_Products_StockQty", "[StockQty] >= 0");
                t.HasCheckConstraint("CK_Products_ReservedQty", "[ReservedQty] >= 0 AND [ReservedQty] <= [StockQty]");
            });
            e.Property(x => x.ProductCode).HasMaxLength(20).IsRequired();
            e.Property(x => x.ProductName).HasMaxLength(200).IsRequired();
            e.Property(x => x.UnitPrice).HasPrecision(18, 2);
            // Optimistic concurrency: an UPDATE only succeeds if the quantities were not changed by someone else.
            e.Property(x => x.StockQty).IsConcurrencyToken();
            e.Property(x => x.ReservedQty).IsConcurrencyToken();
            e.Ignore(x => x.AvailableQty);
            e.HasIndex(x => x.ProductCode).IsUnique();
            e.HasData(ProductSeed.Products);
        });

        modelBuilder.Entity<Cart>(e =>
        {
            e.HasMany(x => x.Items).WithOne(x => x.Cart).HasForeignKey(x => x.CartId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CartItem>(e =>
        {
            e.ToTable(t => t.HasCheckConstraint("CK_CartItems_Quantity", "[Quantity] > 0"));
            e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.CartId, x.ProductId }).IsUnique();
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.Property(x => x.OrderNo).HasMaxLength(30).IsRequired();
            e.Property(x => x.TotalAmount).HasPrecision(18, 2);
            e.HasIndex(x => x.OrderNo).IsUnique();
            e.HasMany(x => x.Items).WithOne(x => x.Order).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderItem>(e =>
        {
            e.Property(x => x.ProductCode).HasMaxLength(20).IsRequired();
            e.Property(x => x.ProductName).HasMaxLength(200).IsRequired();
            e.Property(x => x.UnitPrice).HasPrecision(18, 2);
            e.Property(x => x.LineTotal).HasPrecision(18, 2);
            e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
