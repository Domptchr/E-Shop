using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Helpers;

// Re-runs a stock-changing operation when another request updated the same product first.
public static class ConcurrencyRetry
{
    private const int MaxAttempts = 3;

    public static async Task<T> ExecuteAsync<T>(Func<Task<T>> operation, Action discardChanges)
    {
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                return await operation();
            }
            catch (DbUpdateConcurrencyException) when (attempt < MaxAttempts)
            {
                discardChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ConflictException("มีการแก้ไขข้อมูลสินค้าพร้อมกัน กรุณาลองใหม่อีกครั้ง");
            }
        }
    }
}
