# Hotel Booking Platform

Nền tảng đặt phòng khách sạn trực tuyến.

## Kiến trúc

Dự án gồm 2 phần độc lập trong cùng một repository:

```text
project-root/
├── frontend/   # React + Vite (SPA)
└── backend/    # Node.js + Express REST API (prefix /api)
```

Frontend gọi backend qua `fetch` (xem `frontend/src/services/apiClient.ts`) với base URL lấy từ biến `VITE_API_BASE_URL`.

## Tech stack

| Thành phần     | Công nghệ                              |
| -------------- | -------------------------------------- |
| Frontend       | React + Vite (TypeScript), React Router, TanStack Query |
| Backend        | Node.js + Express (TypeScript)         |
| Database       | Microsoft SQL Server (Prisma + `@prisma/adapter-mssql`) |
| Image Storage  | Cloudinary (+ multer)                  |
| Authentication | JWT (`jsonwebtoken`, `bcrypt`)         |

## Yêu cầu môi trường

- Node.js >= 20 và npm
- Git
- Microsoft SQL Server (chỉ cần khi dùng các endpoint truy cập database)
- Tài khoản Cloudinary (chỉ cần khi dùng chức năng upload ảnh)

## Cài đặt dependency

```bash
cd frontend && npm install
cd ../backend && npm install
```

## Cấu hình `.env`

Sao chép file mẫu và điền giá trị thực (không commit file `.env`):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

- `backend/.env`: `PORT`, `DATABASE_URL` (chuỗi kết nối SQL Server), `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`, `CLOUDINARY_*`, `VNPAY_*`, `SMTP_*`, `CORS_ORIGIN`/`FRONTEND_URL`.
- `frontend/.env`: `VITE_API_BASE_URL` (mặc định `http://localhost:5000/api`).

> Bước `cp frontend/.env.example frontend/.env` là bắt buộc — nếu thiếu, `apiClient` sẽ gọi đường dẫn tương đối `/api` vào chính cổng Vite (5173) thay vì backend, khiến toàn bộ API call thất bại với lỗi "Failed to parse response JSON" dù backend vẫn chạy bình thường.

## Chạy dự án

Frontend (http://localhost:5173):

```bash
cd frontend
npm.cmd run dev
```

Backend (http://localhost:5000):

```bash
cd backend
npm.cmd run dev
```

Kiểm tra backend: `GET http://localhost:5000/api/health`

```json
{ "success": true, "message": "Hotel Booking API is running" }
```

## Build frontend

```bash
cd frontend
npm run build
```
