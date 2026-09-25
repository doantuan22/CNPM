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

> **QUAN TRỌNG — mã hóa ký tự:** mọi file `.sql` trong `database/` chứa literal tiếng Việt có dấu (CHECK constraint, seed data) và được lưu bằng UTF-8. `sqlcmd` mặc định đọc file `-i` theo codepage của console, KHÔNG phải UTF-8, nên nếu chạy thiếu cờ mã hóa, các literal N'...' có dấu sẽ bị biên dịch sai (mojibake) ngay trong constraint — lỗi này từng xảy ra thật ở DB-0 và được phát hiện/sửa trong M1 (xem `db0-report.md`). **Luôn chạy với `-f 65001`**:

```bash
sqlcmd -S <server> -d <database> -i database/migrations/001_core_identity.sql -f 65001
# ... tương tự cho từng migration theo thứ tự 001 → 006, rồi:
sqlcmd -S <server> -d <database> -i database/seed/001_roles.sql -f 65001
```

Kiểm tra sau khi chạy migration:

```bash
sqlcmd -S <server> -d <database> -i database/scripts/verify-schema.sql -f 65001
sqlcmd -S <server> -d <database> -i database/scripts/test-constraints.sql -f 65001
```

`verify-schema.sql` xác nhận đúng 22 bảng chính thức, các override Gate 0 (không có `KHUYEN_MAI_KHACH_SAN`/`CHI_TIET_GIA_DAT_PHONG`, `CHINH_SACH_HUY` không có `MaDatPhong`, `HO_SO_DOI_TAC` có `MaTaiKhoanDuyet`), PK/FK/UNIQUE/CHECK hợp lệ, và không có cột tiền kiểu FLOAT/REAL. `test-constraints.sql` chạy trong 1 transaction luôn ROLLBACK, không để lại dữ liệu.

Xem `database/docs/db0-report.md` để biết kết quả chạy thực tế. DDI-01 (nullability) và DDI-02 (UNIQUE `QUY_PHONG_GIA`) đã **RESOLVED** — quyết định và chi tiết ở Addendum 2 của file đó; áp dụng trực tiếp vào migrations 001/002/003/006, không có migration 007.

## DB-1 seed (M1)

`database/seed/001_roles.sql` nạp 3 vai trò baseline (`Khách hàng`, `Chủ khách sạn`, `Quản trị hệ thống`) vào `VAI_TRO`, idempotent (dùng `MERGE`, chạy lại không tạo trùng). Guest/anonymous không phải tài khoản DB nên không có role row. Không seed CSKH/Employee/HotelStaff/Moderator (G0-09).

## DB-2 dev/demo data (M2 — Discovery)

`backend/prisma/seed-discovery.ts` (chạy bằng `npm run seed:discovery` trong `backend/`) nạp dữ liệu demo cho search/hotel-detail/room/availability: 4 khách sạn tại 3 địa phương, 9 loại phòng, 8 tiện nghi, 45 ngày `QUY_PHONG_GIA` mỗi loại phòng, 1 chính sách hủy hệ thống, và 3 đơn đặt phòng mẫu (một phần chỗ, hết chỗ, và một đơn đã hủy để xác nhận không bị overcount). Đây là script TypeScript (không phải `.sql`) vì `TAI_KHOAN.MatKhau` cần băm bcrypt thật — T-SQL không làm được việc này — nên script dùng chung Prisma Client/`hashPassword()` với ứng dụng. Idempotent: an toàn chạy lại nhiều lần (kiểm tra tồn tại trước khi insert, `upsert` cho `QUY_PHONG_GIA`).
