# Hotel Booking Platform

Nền tảng đặt phòng khách sạn trực tuyến.

## Kiến trúc

Dự án gồm 2 phần độc lập trong cùng một repository:

```text
project-root/
├── frontend/   # React + Vite (SPA)
└── backend/    # Node.js + Express REST API (prefix /api)
```

Frontend gọi backend qua Axios với base URL lấy từ biến `VITE_API_URL`.

## Tech stack

| Thành phần     | Công nghệ                              |
| -------------- | -------------------------------------- |
| Frontend       | React + Vite (JavaScript), React Router, Axios |
| Backend        | Node.js + Express                      |
| Database       | Microsoft SQL Server (`mssql`)         |
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

- `backend/.env`: `PORT`, thông tin SQL Server (`DB_*`), `JWT_SECRET`, `CLOUDINARY_*`, `FRONTEND_URL`.
- `frontend/.env`: `VITE_API_URL` (mặc định `http://localhost:5000/api`).

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
