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
├── DATABASE_SOURCE_CHAPTER_6_7.md   # Nguồn thiết kế chuẩn (Chương 6, Chương 7, Gate 0)
├── migrations/   # DDL baseline DB-0, chạy tuần tự 001 → 006 trên database trống
├── seed/         # Script nạp dữ liệu mẫu ban đầu (seed data) — chưa dùng ở DB-0
├── scripts/      # verify-schema.sql, test-constraints.sql
└── docs/         # data-dictionary.md, constraint-checklist.md, db0-report.md
```

## DB-0 Baseline (hoàn thành)

Flow bắt buộc, không được đảo ngược:

```text
database/DATABASE_SOURCE_CHAPTER_6_7.md  (Chương 6 + Chương 7 + Gate 0)
            ↓
database/migrations/001..006*.sql        (DDL, chạy trên database trống)
            ↓
SQL Server database (source of truth)
            ↓
npx prisma db pull   (trong thư mục backend/)
            ↓
backend/prisma/schema.prisma   (phản ánh DB thật — không tự viết tay)
            ↓
npx prisma generate
```

Kiểm tra sau khi chạy migration:

```bash
sqlcmd -S <server> -d <database> -i database/scripts/verify-schema.sql
sqlcmd -S <server> -d <database> -i database/scripts/test-constraints.sql
```

`verify-schema.sql` xác nhận đúng 22 bảng chính thức, các override Gate 0 (không có `KHUYEN_MAI_KHACH_SAN`/`CHI_TIET_GIA_DAT_PHONG`, `CHINH_SACH_HUY` không có `MaDatPhong`, `HO_SO_DOI_TAC` có `MaTaiKhoanDuyet`), PK/FK/UNIQUE/CHECK hợp lệ, và không có cột tiền kiểu FLOAT/REAL. `test-constraints.sql` chạy trong 1 transaction luôn ROLLBACK, không để lại dữ liệu.

Xem `database/docs/db0-report.md` để biết kết quả chạy thực tế và 2 Database Design Issue còn cần xác nhận (DDI-01, DDI-02) trước khi triển khai DB-1.
