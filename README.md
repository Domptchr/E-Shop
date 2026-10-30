# E-Commerce (Next.js + .NET 9)

ระบบเลือกซื้อสินค้า ตะกร้าสินค้า Checkout และหน้าดู Stock

```
backend/   ECommerce.API   (.NET 9 Web API, N-Tier: Controllers → Services → Repositories → Data)
           ECommerce.Tests (xUnit: ทดสอบ logic ของ Stock)
frontend/  Next.js + Untitled UI React
```

## วิธีรัน

### 1. Backend (http://localhost:5100)
```bash
cd backend/ECommerce.API
dotnet run
```
- ตอน start ระบบจะรัน migration ให้อัตโนมัติ: สร้าง DB `ECommerceDB` บน `LAPTOP-0EI6JICQ\SQLEXPRESS` และใส่สินค้า mock 12 รายการ
- Swagger: http://localhost:5100/swagger
- Connection string อยู่ใน `appsettings.json`

### 2. Frontend (http://localhost:3000)
```bash
cd frontend
npm install
npm run dev
```
URL ของ API ตั้งค่าใน `frontend/.env.local` (`NEXT_PUBLIC_API_URL`)

## หน้าจอ
| หน้า | URL |
|---|---|
| เลือกซื้อสินค้า | `/` |
| ตะกร้าสินค้า + Checkout | `/cart` |
| สรุปคำสั่งซื้อ | `/orders/{id}` |
| Stock สินค้า | `/stock` |

## ฐานข้อมูล
ER Diagram และคำอธิบายตาราง ดูได้ที่ [docs/er-diagram.md](docs/er-diagram.md)

![ER Diagram](docs/er-diagram.png)

## กฎของ Stock (จอง + ตัดจริง)
- `StockQty` = จำนวนจริงในคลัง, `ReservedQty` = ถูกจองอยู่ในตะกร้า, `Available` = Stock − Reserved
- เพิ่มสินค้าลงตะกร้า / กด + : ถ้า Available ไม่พอจะตอบ 409 "สินค้า X คงเหลือไม่เพียงพอ" ถ้าพอจะเพิ่ม `ReservedQty`
- กด − / ลบรายการ / ล้างตะกร้า : คืนยอด `ReservedQty`
- Checkout : ตัด `StockQty` และ `ReservedQty` บันทึก Order/OrderItems แล้วล้างตะกร้า โดยทั้งหมดอยู่ใน `SaveChanges` ครั้งเดียว
- กันการแก้ไขชนกันด้วย optimistic concurrency (`StockQty`/`ReservedQty` เป็น concurrency token และ retry 3 ครั้ง) พร้อม check constraint `0 <= ReservedQty <= StockQty`

## การทดสอบ (Unit Tests)

### ภาพรวม
- โปรเจ็ค `backend/ECommerce.Tests` ใช้ **xUnit** ทดสอบ **ชั้น Service** (`CartService`, `OrderService`) ซึ่งเป็นที่อยู่ของกฎเรื่อง Stock ทั้งหมด
- ไม่ต่อ SQL Server จริง ใช้ **EF Core InMemory** เป็น DB ปลอมในหน่วยความจำ แต่ละเทสได้ DB ใหม่ของตัวเอง (ตั้งชื่อด้วย `Guid.NewGuid()`) เทสจึงไม่ปนกัน
- แต่ละเทสเขียนแบบ **Arrange → Act → Assert**: เตรียมข้อมูล → เรียกฟังก์ชัน → ตรวจผล
- ข้อมูลตั้งต้นทุกเทส: **Mouse** (ราคา 100, Stock 10) และ **Cable** (ราคา 50, Stock 3)

### วิธีรัน
```bash
cd backend
dotnet test
```
ผลที่ถูกต้อง: `Passed! - Failed: 0, Passed: 12`

### รายการเทส
**`CartServiceTests` (9 เทส): ตะกร้าสินค้า**
| เทส | ตรวจว่า |
|---|---|
| `AddItem_ReservesStock_AndComputesTotal` | ใส่ Mouse 3 ชิ้น → จองเพิ่ม 3, Stock จริงยังเป็น 10, ยอดรวม 300 |
| `AddItem_SameProductTwice_MergesQuantity` | ใส่สินค้าเดิมซ้ำ (2 + 4) → รวมเป็นแถวเดียว 6 ชิ้น |
| `AddItem_MoreThanAvailable_ThrowsAndKeepsStock` | Cable เหลือ 1 แต่ขอ 2 → error "เหลือ 1 ชิ้น" และยอดจองไม่เปลี่ยน |
| `AddItem_ReservedByAnotherCart_IsNotAvailable` | ตะกร้า A จอง Cable หมดแล้ว → ตะกร้า B ใส่ไม่ได้ |
| `UpdateItem_IncreaseAndDecrease_AdjustsReservation` | ปรับจำนวน 2 → 5 → 1 แล้วยอดจองตามถูกทุกครั้ง |
| `UpdateItem_AboveAvailable_Throws` | ปรับเกินที่เหลือ → error และยอดจองเดิมไม่เปลี่ยน |
| `RemoveItem_ReleasesReservation` | ลบรายการ → คืนยอดจองเฉพาะสินค้านั้น ส่วนอื่นไม่เปลี่ยน |
| `Clear_ReleasesAllReservations` | ล้างตะกร้า → คืนยอดจองทุกสินค้า และตะกร้าว่าง |
| `UnknownCart_ThrowsNotFound` | เรียกตะกร้าที่ไม่มีอยู่ → NotFound (404) |

**`OrderServiceTests` (3 เทส): Checkout**
| เทส | ตรวจว่า |
|---|---|
| `Checkout_CutsStock_ReleasesReservation_AndEmptiesCart` | Checkout Mouse 3 + Cable 3 → ยอด 450, Stock ลดจริง (10→7, 3→0), ยอดจองกลับเป็น 0, ตะกร้าว่าง |
| `Checkout_DoesNotTouchOtherCartsReservation` | Checkout ตะกร้าเรา (2 ชิ้น) → ยอดจองของตะกร้าอื่น (5 ชิ้น) ยังอยู่ครบ |
| `Checkout_EmptyCart_Throws` | ตะกร้าว่าง → Checkout ไม่ได้ และไม่มี Order เกิดขึ้น |


## API
| Method | Route |
|---|---|
| GET | `/api/products` |
| POST | `/api/carts` |
| GET | `/api/carts/{cartId}` |
| POST | `/api/carts/{cartId}/items` `{ productId, quantity }` |
| PATCH | `/api/carts/{cartId}/items/{productId}` `{ quantity }` |
| DELETE | `/api/carts/{cartId}/items/{productId}` |
| DELETE | `/api/carts/{cartId}/items` |
| POST | `/api/carts/{cartId}/checkout` |
| GET | `/api/orders/{id}` |
