# Bug Audit Log — Newly Registered Hotel in Pending Approval Cannot Be Activated by Admin

| Trường | Nội dung |
|---|---|
| **ID** | BUG-010 |
| **Phát hiện** | 2026-10-03 (via `admin-hotels.test.ts` & `core-flows.e2e.test.ts`) |
| **Mức độ** | 🟠 **MEDIUM - HIGH** — Khách sạn đăng ký mới bị kẹt vĩnh viễn ở trạng thái "Chờ duyệt", Quản trị viên không thể phê duyệt mở bán qua API/UI |
| **Module** | `backend/src/modules/admin-hotels/admin-hotels.service.ts`, `admin-hotels.schemas.ts`, `frontend/src/pages/admin/AdminHotelDetailPage.tsx` |
| **Trạng thái** | 🔴 **CONFIRMED (Chờ hội ý / sửa)** |
| **Phát hiện bởi** | Đối chiếu luồng đăng ký khách sạn mới (Luồng 5: Đăng ký khách sạn & Duyệt mở bán) giữa Backend và Frontend |

---

## 1. Mô tả hiện tượng và phân tích luồng nghiệp vụ

Theo quy trình nghiệp vụ của nền tảng:
1. Đối tác / Chủ khách sạn sau khi được duyệt hồ sơ nộp đơn tạo cơ sở lưu trú mới qua API `POST /api/owner/hotels`.
2. Khách sạn mới tạo được tự động gán trạng thái ban đầu là **`Chờ duyệt`** (`HOTEL_STATUS.PENDING_APPROVAL`).
3. Chủ khách sạn không có quyền tự kích hoạt khách sạn (trường `TrangThai` bị cố tình loại trừ khỏi `createHotelSchema`/`updateHotelSchema` của Owner để tránh tự duyệt).
4. Khách sạn cần được Quản trị viên (Admin) kiểm tra thông tin và phê duyệt chuyển sang trạng thái **`Hoạt động`** (`HOTEL_STATUS.ACTIVE`) thì mới xuất hiện trên trang tìm kiếm công khai cho du khách đặt phòng.

### Vấn đề logic tại Backend:
Tại [`backend/src/modules/admin-hotels/admin-hotels.service.ts`](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/backend/src/modules/admin-hotels/admin-hotels.service.ts#L2):
```typescript
async setSuspended(id: number, suspend: boolean) {
  const hotel = await this.getOne(id);
  if (suspend) {
    if (hotel.TrangThai === HOTEL_STATUS.SUSPENDED) return hotel;
    return getPrismaClient().kHACH_SAN.update({
      where: { MaKhachSan: id },
      data: { TrangThai: HOTEL_STATUS.SUSPENDED, NgayCapNhat: new Date() }
    });
  } 
  // Điểm lỗi: Chỉ cho phép kích hoạt nếu trạng thái hiện tại là 'Đình chỉ' (SUSPENDED)
  if (hotel.TrangThai !== HOTEL_STATUS.SUSPENDED)
    throw AppError.badRequest('Chỉ có thể kích hoạt lại khách sạn đang bị đình chỉ');
  return getPrismaClient().kHACH_SAN.update({
    where: { MaKhachSan: id },
    data: { TrangThai: HOTEL_STATUS.ACTIVE, NgayCapNhat: new Date() }
  });
}
```

Và tại [`backend/src/modules/admin-hotels/admin-hotels.schemas.ts`](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/backend/src/modules/admin-hotels/admin-hotels.schemas.ts#L4):
```typescript
export const updateHotelSchema = z.object({
  TenKhachSan: z.string().min(2).max(255),
  DiaChiChiTiet: z.string().min(5).max(500),
  HangSao: z.coerce.number().int().min(1).max(5),
  MoTa: z.string().max(4000).nullable(),
  GioNhanPhong: z.coerce.date(),
  GioTraPhong: z.coerce.date(),
  MaDiaPhuong: z.coerce.number().int().positive()
}).partial();
```

### Đối chiếu với Frontend:
Tại trang chi tiết kiểm duyệt khách sạn của Quản trị viên ([`frontend/src/pages/admin/AdminHotelDetailPage.tsx`](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/frontend/src/pages/admin/AdminHotelDetailPage.tsx#L49)):
- Quản trị viên xem thông tin khách sạn đang `Chờ duyệt`.
- Nút bấm duyệt / kích hoạt khách sạn gọi trực tiếp hàm `reactivateAdminHotel(id)` (gửi request `POST /api/admin/hotels/:id/reactivate`).
- Request này bị backend từ chối ngay lập tức với lỗi `400 Bad Request`: `"Chỉ có thể kích hoạt lại khách sạn đang bị đình chỉ"`.
- Thử cập nhật qua `PATCH /api/admin/hotels/:id` cũng vô hiệu do `updateHotelSchema` không cho phép cập nhật `TrangThai`.

### Hậu quả:
- Mọi khách sạn mới do đối tác nộp hồ sơ bị **kẹt vĩnh viễn ở trạng thái "Chờ duyệt"**.
- Quản trị viên hoàn toàn bất lực, không có bất kỳ endpoint API hợp lệ nào để phê duyệt hoặc mở bán khách sạn mới.

---

## 2. Bằng chứng kiểm thử tự động (Test Output)

File kiểm thử tái hiện: [`backend/src/modules/admin-hotels/admin-hotels.test.ts`](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/backend/src/modules/admin-hotels/admin-hotels.test.ts#L43)

```
✓ [BUG-010] newly created hotel in PENDING_APPROVAL cannot be activated/approved by Admin via reactivate or patch (1082ms)
```

Kiểm thử xác nhận:
1. Khách sạn nộp đăng ký có `TrangThai: 'Chờ duyệt'`.
2. Admin gọi `POST /api/admin/hotels/:id/reactivate` bị từ chối `400` với thông báo `"Chỉ có thể kích hoạt lại khách sạn đang bị đình chỉ"`.
3. Admin gọi `PATCH /api/admin/hotels/:id` với body `{ TrangThai: 'Hoạt động' }` bị Zod schema lờ đi, trạng thái vẫn là `'Chờ duyệt'`.

---

## 3. Giải pháp đề xuất (Sau khi người dùng đồng ý sửa)

Mở rộng điều kiện kiểm tra trong `setSuspended` của `admin-hotels.service.ts`:

```typescript
// Cho phép kích hoạt nếu khách sạn đang 'Đình chỉ' HOẶC đang 'Chờ duyệt'
if (hotel.TrangThai !== HOTEL_STATUS.SUSPENDED && hotel.TrangThai !== HOTEL_STATUS.PENDING_APPROVAL) {
  throw AppError.badRequest('Chỉ có thể kích hoạt khách sạn đang chờ duyệt hoặc bị đình chỉ');
}
```

Hoặc bổ sung một endpoint chuyên trách duyệt khách sạn mới:
`POST /api/admin/hotels/:id/approve`
tương ứng với hành vi phê duyệt đăng ký cơ sở lưu trú mới trong luồng UC32/UC33.

