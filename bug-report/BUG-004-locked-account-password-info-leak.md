# Bug Audit Log — Password Info Leak for Locked Accounts

| Trường | Nội dung |
|---|---|
| **ID** | BUG-004 |
| **Phát hiện** | 2026-10-03 (via auth.test.ts) |
| **Mức độ** | 🟠 **MEDIUM** — Lộ thông tin mật khẩu cho kẻ tấn công |
| **Module** | `backend/src/modules/auth/auth.service.ts` |
| **Trạng thái** | ✅ **FIXED** — Đã sửa ngày 2026-10-03 |
| **Phát hiện bởi** | Phân tích thứ tự kiểm tra điều kiện trong `login()` |

---

## Mô tả

Hàm `login()` trong [`auth.service.ts`](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/backend/src/modules/auth/auth.service.ts) kiểm tra trạng thái tài khoản (`LOCKED`) **SAU KHI** đã so sánh mật khẩu. Thứ tự kiểm tra này vô tình tạo ra 2 phản hồi khác nhau:

| Trường hợp | HTTP Response | Thông điệp |
|---|---|---|
| Tài khoản LOCKED + sai mật khẩu | **401 Unauthorized** | "Mật khẩu không đúng" |
| Tài khoản LOCKED + đúng mật khẩu | **403 Forbidden** | "Tài khoản đã bị khóa" |

Sự khác biệt này cho phép kẻ tấn công biết được mật khẩu của họ có chính xác hay không đối với một tài khoản đã bị khóa. Đây là kỹ thuật **information oracle** phổ biến trong security testing.

---

## Root Cause

### Code trước khi fix

```typescript
// auth.service.ts L88-94 (cũ — SAI thứ tự)
const validPassword = await verifyPassword(input.MatKhau, account.MatKhau);
if (!validPassword) {
  throw AppError.unauthorized('Email/tên đăng nhập hoặc mật khẩu không đúng');
  // ↑ SAI password với locked account → 401 (lộ info!)
}
if (account.TrangThai === ACCOUNT_STATUS.LOCKED) {
  throw AppError.forbidden('Tài khoản đã bị khóa');
  // ↑ ĐÚNG password với locked account → 403 (kẻ tấn công biết được!)
}
```

---

## Bằng chứng (Test Output)

```
✗ [BUG-004] locked account with WRONG password must return 401, not differ from correct-password 403
  AssertionError: expected 401 to be 403 // Object.is equality
  
  Locked + wrong password  → 401
  Locked + correct password → 403   ← different response reveals password validity
```

---

## Fix đã thực hiện

Chuyển kiểm tra `LOCKED` lên **TRƯỚC** khi verify mật khẩu.

```typescript
// auth.service.ts (mới — ĐÚNG thứ tự)
// Check account status BEFORE password verification.
// Checking it after would leak password validity.
if (account.TrangThai === ACCOUNT_STATUS.LOCKED) {
  throw AppError.forbidden('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên');
}

const validPassword = await verifyPassword(input.MatKhau, account.MatKhau);
if (!validPassword) {
  throw AppError.unauthorized('Email/tên đăng nhập hoặc mật khẩu không đúng');
}
```

Tuy nhiên, `LOCKED + bất kỳ password nào` hiện tại sẽ trả về **403** thay vì **401**. Đây là sự đánh đổi có chủ đích: kẻ tấn công biết tài khoản bị khóa nhưng **không biết** mật khẩu có đúng không. Nếu muốn ẩn hoàn toàn, có thể trả 401 cho tất cả — nhưng khi đó UX kém hơn vì người dùng hợp lệ không biết tại sao không đăng nhập được.

---

## Checklist sau khi fix

- [x] Fix code trong `auth.service.ts`
- [x] Test case `[BUG-004]` pass: `locked + wrong = locked + correct` (cùng HTTP status)
- [x] 28/28 tests trong `auth.test.ts` pass
