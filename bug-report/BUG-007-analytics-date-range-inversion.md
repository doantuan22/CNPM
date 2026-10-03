# Bug Audit Log — Analytics Date Range Inversion Allowed

| Trường | Nội dung |
|---|---|
| **ID** | BUG-007 |
| **Phát hiện** | 2026-10-03 (via `admin-analytics.test.ts`) |
| **Mức độ** | 🟡 **LOW** — Thiếu validation kiểm tra khoảng ngày hợp lệ |
| **Module** | `backend/src/modules/analytics/date-range.ts` |
| **Trạng thái** | 🔴 **CONFIRMED (Chờ hội ý / sửa)** |
| **Phát hiện bởi** | So sánh tính nhất quán giữa các schema query khoảng ngày trong hệ thống |

---

## 1. Mô tả hiện tượng

Trong [`date-range.ts`](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/backend/src/modules/analytics/date-range.ts), schema `dateRangeQuerySchema` được dùng chung cho cả Owner Analytics (`/api/owner/hotels/:id/analytics`) và Admin Analytics (`/api/admin/analytics`):

```typescript
export const dateRangeQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
```

Schema này không có khối `.refine()` để kiểm tra logic `from <= to`. Nếu client gửi một khoảng ngày bị đảo ngược (ví dụ `from=2026-10-20&to=2026-10-10`):
- API không quăng `400 Bad Request`.
- API vẫn trả về `200 OK` với dữ liệu doanh thu bằng `0` và tỷ lệ lấp đầy `null`.
- Các câu query cơ sở dữ liệu xử lý điều kiện vô lý `NgayTao >= 2026-10-20 AND NgayTao < 2026-10-11` gây lãng phí tài nguyên máy chủ.

Trong khi đó, tất cả các endpoint khác có khoảng ngày trong dự án (`admin-payments.schemas.ts`, `owner-rates.schemas.ts`, `bookings.schemas.ts`, `hotels.schemas.ts`) đều chặn chặt chẽ bằng `.refine()` và trả `400 Bad Request`.

---

## 2. Bằng chứng kiểm thử tự động (Test Output)

```
FAIL src/modules/analytics/admin-analytics.test.ts > [BUG-007] rejects an inverted date range (from > to) with 400 Bad Request
AssertionError: expected 200 to be 400 // Object.is equality

- Expected
+ Received

- 400
+ 200
```

---

## 3. Giải pháp đề xuất

Bổ sung `.refine()` vào `dateRangeQuerySchema` trong `backend/src/modules/analytics/date-range.ts`:

```typescript
export const dateRangeQuerySchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine((data) => !data.from || !data.to || data.from.getTime() <= data.to.getTime(), {
    message: '"to" phải sau hoặc bằng "from"',
    path: ['to'],
  });
```
