# Database Specifications & Management

Thư mục này lưu trữ toàn bộ tài nguyên liên quan đến Database (Microsoft SQL Server) của dự án.

## Nguyên tắc quản lý Database (TECH-0)

1. **Database / SQL Server schema là nguồn chuẩn (Single Source of Truth)**.
2. **Tuyệt đối không**:
   - Tự thêm bảng, xóa bảng, đổi tên bảng.
   - Tự đổi tên cột, kiểu dữ liệu, ràng buộc khóa ngoại (FK).
   - Tự thay đổi schema nghiệp vụ để phục vụ sự tiện lợi của Prisma.
   - Tự sinh thêm entity nghiệp vụ khi chưa có phê duyệt từ thiết kế chuẩn.
3. **Prisma ORM chỉ đóng vai trò Data Access Layer**:
   - `backend/prisma/schema.prisma` phản ánh cấu trúc schema từ database chuẩn thông qua introspect / schema mapping, không thay thế cho thiết kế database gốc.

## Cấu trúc thư mục

```text
database/
├── migrations/   # Các file SQL migration định kỳ theo phiên bản
├── seed/         # Script nạp dữ liệu mẫu ban đầu (seed data)
├── scripts/      # Script tiện ích (backup, restore, maintenance)
└── docs/         # Tài liệu ERD, data dictionary, quy ước đặt tên
```
