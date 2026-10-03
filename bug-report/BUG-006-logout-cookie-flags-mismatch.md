# Bug Audit Log — Logout Cookie Options Mismatch

| Trường | Nội dung |
|---|---|
| **ID** | BUG-006 |
| **Phát hiện** | 2026-10-03 (via `auth.test.ts`) |
| **Mức độ** | 🟠 **MEDIUM** — Lỗi chấm dứt phiên đăng nhập trên môi trường Production (HTTPS) |
| **Module** | `backend/src/modules/auth/auth.controller.ts` |
| **Trạng thái** | 🔴 **CONFIRMED (Chờ hội ý / sửa)** |
| **Phát hiện bởi** | Phân tích cơ chế xóa cookie đăng xuất theo chuẩn RFC 6265 |

---

## 1. Mô tả hiện tượng

Trong [`auth.controller.ts`](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/backend/src/modules/auth/auth.controller.ts), khi người dùng đăng nhập thành công, hệ thống thiết lập cookie `refresh_token` với cấu hình bảo mật:
```typescript
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth',
  maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
};
```

Tuy nhiên, khi gọi API đăng xuất `POST /api/auth/logout`:
```typescript
res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/api/auth' });
```
Hàm `clearCookie` chỉ truyền `{ path: '/api/auth' }`, hoàn toàn bỏ qua các cờ `httpOnly: true`, `secure: true`, và `sameSite: 'lax'`.

Theo đặc tả **RFC 6265** và tài liệu chính thức của Express:
> *"Web browsers and other compliant clients will only clear the cookie if the given options is identical to those given to res.cookie(), excluding expires and maxAge."*

Do thiếu các cờ bảo mật (đặc biệt là `Secure` và `HttpOnly`), trên môi trường production (HTTPS), trình duyệt hiện đại (Chrome, Edge, Firefox, Safari) sẽ **từ chối xóa cookie** `refresh_token`. Người dùng tưởng rằng mình đã đăng xuất, nhưng cookie refresh token vẫn tồn tại nguyên vẹn trong trình duyệt.

---

## 2. Bằng chứng kiểm thử tự động (Test Output)

```
FAIL src/modules/auth/auth.test.ts > POST /api/auth/logout > [BUG-006] clears the refresh token cookie with matching HttpOnly and SameSite attributes
AssertionError: expected 'refresh_token=; path=/api/auth; expir…' to contain 'httponly'

Expected: "httponly"
Received: "refresh_token=; path=/api/auth; expires=thu, 01 jan 1970 00:00:00 gmt"
```

Header `Set-Cookie` trả về không có `HttpOnly` và `SameSite=Lax`, vi phạm tính nhất quán của cookie session.

---

## 3. Giải pháp đề xuất

Trong `auth.controller.ts`, tái sử dụng `REFRESH_COOKIE_OPTIONS` nhưng bỏ `maxAge` khi gọi `clearCookie`:

```typescript
// auth.controller.ts
logout = async (_req: Request, res: Response): Promise<void> => {
  const { maxAge: _maxAge, ...clearOptions } = REFRESH_COOKIE_OPTIONS;
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, clearOptions);
  sendSuccess(res, undefined, 'Đăng xuất thành công');
};
```
