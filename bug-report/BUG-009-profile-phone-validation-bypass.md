# Bug Audit Log — Profile Phone Number Validation Bypass

| Trường | Nội dung |
|---|---|
| **ID** | BUG-009 |
| **Phát hiện** | 2026-10-03 (via `profile.test.ts`) |
| **Mức độ** | 🟡 **LOW** — Không đồng bộ định dạng dữ liệu đầu vào |
| **Module** | `backend/src/modules/profile/profile.schemas.ts` |
| **Trạng thái** | 🔴 **CONFIRMED (Chờ hội ý / sửa)** |
| **Phát hiện bởi** | Đối chiếu schema validation giữa đăng ký (`auth.schemas.ts`) và cập nhật hồ sơ (`profile.schemas.ts`) |

---

## 1. Mô tả hiện tượng

Trong [`auth.schemas.ts`](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/backend/src/modules/auth/auth.schemas.ts) (L12), khi đăng ký tài khoản, hệ thống kiểm tra số điện thoại rất chặt chẽ bằng biểu thức chính quy (regex):
```typescript
SoDienThoai: z.string().trim().regex(/^\+?[0-9]{8,15}$/, 'Số điện thoại không hợp lệ')
```

Tuy nhiên, trong [`profile.schemas.ts`](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/backend/src/modules/profile/profile.schemas.ts) (L8), khi người dùng cập nhật hồ sơ qua `PATCH /api/profile/me`:
```typescript
SoDienThoai: z.string().min(8, 'Số điện thoại không hợp lệ').max(20)
```
Schema này chỉ kiểm tra độ dài từ 8 đến 20 ký tự mà **hoàn toàn không kiểm tra xem chuỗi có phải là số điện thoại hay không**. Người dùng có thể cập nhật số điện thoại thành `"not-a-phone-number"`, `"abcdefgh"`, hoặc các ký tự đặc biệt mà API vẫn trả về `200 OK`.

---

## 2. Bằng chứng kiểm thử tự động (Test Output)

```
FAIL src/modules/profile/profile.test.ts > PATCH /api/profile/me > [BUG-009] rejects non-numeric phone number in profile update with 400
AssertionError: expected 200 to be 400 // Object.is equality

- Expected
+ Received

- 400
+ 200

 ❯ src/modules/profile/profile.test.ts:137:24
    135|       .send({ SoDienThoai: 'not-a-phone-number' });
    136| 
    137|     expect(res.status).toBe(400);
```

---

## 3. Giải pháp đề xuất

Đồng bộ schema `SoDienThoai` trong `profile.schemas.ts` với `auth.schemas.ts`:

```typescript
// backend/src/modules/profile/profile.schemas.ts
export const updateProfileSchema = z
  .object({
    HoTen: z.string().trim().min(2, 'Họ tên ít nhất 2 ký tự').max(150),
    SoDienThoai: z.string().trim().regex(/^\+?[0-9]{8,15}$/, 'Số điện thoại không hợp lệ'),
    NgaySinh: z.coerce.date(),
    GioiTinh: z.enum(['Nam', 'Nữ', 'Khác']),
    AnhDaiDien: z.string().max(500).optional(),
  })
  .partial();
```
