# Kiến Trúc Hệ Thống (System Architecture) - TECH-0 Foundation

Tài liệu mô tả kiến trúc tổng thể của hệ thống "Nền tảng đặt phòng khách sạn trực tuyến".

## 1. Mô hình kiến trúc phân tầng

```text
[ Browser / Client ]
        │
        ▼ (HTTPS / JSON REST API)
[ React Frontend (Vite + TypeScript) ]
        │
        ▼
[ Node.js Express Backend (TypeScript) ]
        │
   ┌────┴───────────────────────────┐
   ▼                                ▼
[ Microsoft SQL Server ]   [ 3rd-party Integrations ]
(Database chuẩn / Azure)   - Cloudinary (Image Storage)
                           - VNPAY Sandbox (Payment - Phase 2)
```

## 2. Kiến trúc Backend

Backend tuân thủ nghiêm ngặt mô hình phân tầng:
```text
HTTP Request
  └── Route
        └── Middleware (Auth, Validation, RateLimit, Error)
              └── Controller (Nhận Request, validate DTO, trả HTTP Response)
                    └── Service (Xử lý nghiệp vụ, transaction, orchestration)
                          └── Repository / Data Access (Thao tác dữ liệu)
                                └── Prisma ORM 7.x (Client + SQL Server Driver Adapter)
                                      └── Microsoft SQL Server
```

### Nguyên tắc Backend:
1. **Controller không chứa business logic**: Controller chỉ làm nhiệm vụ parse HTTP request, gọi service tương ứng và chuẩn hóa HTTP response.
2. **Service độc lập với HTTP context**: Service nhận input thuần túy (data transfer object / primitives) và trả về domain data / errors.
3. **Repository quản lý data access**: Mọi câu truy vấn dữ liệu thông qua Prisma ORM hoặc raw SQL adapter đều tập trung tại Repository.
4. **Fail-fast Environment**: Mọi biến môi trường được validate qua Zod ngay khi khởi động (`src/config/env.ts`).

## 3. Kiến trúc Frontend

Frontend là ứng dụng Single Page Application (SPA) phát triển bằng React 19, TypeScript, và Vite.

### Nguyên tắc quản lý State (State Separation):
- **Server State**: Quản lý bằng **TanStack Query** (caching, revalidation, optimistic updates). Không đưa toàn bộ API responses vào global state.
- **Form State**: Quản lý bằng **React Hook Form** kết hợp với **Zod** schema resolver.
- **URL / Navigation State**: Quản lý bằng **React Router** (search params, filters, pagination, dynamic route parameters).
- **Client / Global UI State**: Chỉ sử dụng **Zustand** khi thực sự cần cho UI state toàn cục (sidebar open/close, active modal, user UI preferences).

## 4. Bảo mật biến môi trường

1. **Tuyệt đối không đưa secrets vào Frontend**:
   - `DATABASE_PASSWORD`
   - `DATABASE_URL` (chứa credential)
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
   - `CLOUDINARY_API_SECRET`
   - `VNPAY_HASH_SECRET`
2. **Frontend chỉ dùng biến public**: tiền tố `VITE_` (ví dụ `VITE_API_BASE_URL`, `VITE_APP_ENV`).
