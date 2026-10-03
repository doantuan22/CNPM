# Bug Audit Log — Owner Bookings Dashboard Missing Passive Sweeps

| Trường | Nội dung |
|---|---|
| **ID** | BUG-008 |
| **Phát hiện** | 2026-10-03 (via `owner-bookings.test.ts`) |
| **Mức độ** | 🟠 **MEDIUM** — Trạng thái booking bị hiển thị sai/cũ trên trang quản lý của Chủ khách sạn |
| **Module** | `backend/src/modules/owner/owner-bookings.service.ts` |
| **Trạng thái** | 🔴 **CONFIRMED (Chờ hội ý / sửa)** |
| **Phát hiện bởi** | Đối chiếu luồng quét tự động `expireStalePendingBookings` và `completeFinishedBookings` |

---

## 1. Mô tả hiện tượng

Hệ thống backend sử dụng cơ chế **passive sweep** (quét thụ động mỗi khi có request) để cập nhật trạng thái đơn đặt phòng:
1. `expireStalePendingBookings(prisma)`: Tự động hủy các đơn đặt phòng ở trạng thái `Chờ thanh toán` (`PENDING_PAYMENT`) quá 15 phút mà khách không thanh toán, giải phóng phòng tồn kho.
2. `completeFinishedBookings(prisma)`: Tự động chuyển các đơn `Đã xác nhận` (`CONFIRMED`) sang `Hoàn tất` (`COMPLETED`) sau khi ngày trả phòng kết thúc.

Trong module khách hàng (`bookings.service.ts`), tất cả các hàm `listMyBookings`, `getBookingDetail`, `cancelBooking` đều gọi cả 2 hàm sweep này trước khi truy vấn dữ liệu.

Tuy nhiên, trong [`owner-bookings.service.ts`](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/backend/src/modules/owner/owner-bookings.service.ts), cả hai hàm:
- `list(ownerId, hotelId, query)`
- `getOne(ownerId, hotelId, bookingId)`

**hoàn toàn không gọi** `expireStalePendingBookings` và `completeFinishedBookings`.

### Hậu quả:
- Khách hàng đã bỏ dở thanh toán từ 1 tiếng trước, đơn đặt phòng đã quá hạn nhưng Chủ khách sạn mở danh sách đơn đặt phòng vẫn thấy trạng thái là `"Chờ thanh toán"`.
- Khách hàng đã trả phòng từ tuần trước, nhưng trên dashboard của khách sạn đơn vẫn hiển thị là `"Đã xác nhận"` thay vì `"Hoàn tất"`.

---

## 2. Bằng chứng kiểm thử tự động (Test Output)

```
FAIL src/modules/owner/owner-bookings.test.ts > [BUG-008] auto-expires stale pending bookings before returning to owner
AssertionError: expected 'Chờ thanh toán' to be 'Đã hủy' // Object.is equality

Expected: "Đã hủy"
Received: "Chờ thanh toán"

 ❯ src/modules/owner/owner-bookings.test.ts:121:37
    119| 
    120| expect(res.status).toBe(200);
    121| expect(res.body.data.TrangThai).toBe(BOOKING_STATUS.CANCELLED);
```

---

## 3. Giải pháp đề xuất

Trong `backend/src/modules/owner/owner-bookings.service.ts`, import và gọi cả hai hàm sweep trước khi truy vấn:

```typescript
import { expireStalePendingBookings } from '../bookings/booking-expiry';
import { completeFinishedBookings } from '../bookings/booking-completion';
import { getPrismaClient } from '../../config/prisma';

// Trong hàm list():
async list(ownerId: number, hotelId: number, query: OwnerBookingsQuery) {
  await this.hotels.getOwnedHotel(ownerId, hotelId);
  await expireStalePendingBookings(getPrismaClient());
  await completeFinishedBookings(getPrismaClient());
  const { items, total } = await this.repository.listForHotel(hotelId, query);
  ...
}

// Trong hàm getOne():
async getOne(ownerId: number, hotelId: number, bookingId: number) {
  await this.hotels.getOwnedHotel(ownerId, hotelId);
  await expireStalePendingBookings(getPrismaClient());
  await completeFinishedBookings(getPrismaClient());
  const booking = await this.repository.findForHotel(hotelId, bookingId);
  ...
}
```
