# DB-0 Baseline Report

## Addendum (found and fixed during M1): sqlcmd input codepage corrupted Vietnamese CHECK literals

While seeding roles for M1, `VAI_TRO.TenVaiTro` values written with correct Vietnamese diacritics came back with wrong `LEN()` results after being inserted via a migration run through `sqlcmd -i <file>.sql` **without** `-f 65001`. Root cause: `sqlcmd` reads `-i` script files using the console's codepage by default, not UTF-8, so multi-byte UTF-8 sequences in `N'...'` literals get reinterpreted byte-by-byte. This affected every migration's Vietnamese CHECK constraint literals compiled during the original DB-0 run (`CK_HO_SO_DOI_TAC_TrangThaiDuyet`, `CK_KHUYEN_MAI_LoaiGiamGia`, `CK_KHUYEN_MAI_PhamViApDung`, `CK_YEU_CAU_HO_TRO_LoaiYeuCau`) — the constraints were syntactically valid and passed every DB-0 test, but the comparison literals baked into them were mojibake, silently mismatching any correctly-encoded Vietnamese value the application would ever send. DB-0's own `test-constraints.sql` did not catch this because its only closed-domain test (TEST 8) used a value without diacritics.

**Fix applied:** `HotelBooking_DB0_Test` was dropped and rebuilt, all 6 migrations re-run with `sqlcmd ... -f 65001`, confirmed via `SELECT definition FROM sys.check_constraints` that literals now read correctly (e.g. `N'Chờ duyệt'` instead of mojibake). `database/scripts/test-constraints.sql` gained a new positive TEST 9b that inserts a valid Vietnamese-diacritic closed-domain value and asserts it is **accepted**, specifically to catch this class of bug in the future. `database/README.md` now documents the `-f 65001` requirement for every `sqlcmd -i` invocation against these scripts. `verify-schema.sql` and `test-constraints.sql` were re-run — both still **PASS**.

No `.sql` file content needed to change — the files on disk were always correct UTF-8; only the *execution command* was missing the encoding flag. This does not change any conclusion in the report below (still PASS), but the exit-gate checklist should be read together with this addendum.

---

## Addendum 2 (post-M1): DDI-01 và DDI-02 đã RESOLVED — baseline migrations 001–006 sửa trực tiếp

Sau khi M1 hoàn thành, người dùng đã chốt phương án cho cả hai Database Design Issue còn mở từ DB-0. Theo đúng chỉ dẫn của người dùng, **không tạo migration 007** — sửa trực tiếp `database/migrations/001_core_identity.sql`, `002_hotel_catalog.sql`, `003_room_inventory.sql`, `006_payment_after_sales.sql` (bốn file đúng bằng số bảng bị ảnh hưởng), rebuild `HotelBooking_DB0_Test` từ zero, re-introspect Prisma, và chạy lại toàn bộ regression M1. Xem `docs/m1-report.md` phần "DDI cleanup" để biết chi tiết kết quả test/regression.

## DATABASE DESIGN ISSUES — RESOLVED

### DDI-01: Nullability trên các cột hồ sơ mô tả — RESOLVED

- **Quyết định chính thức của người dùng:**

  | Cột | Quyết định | Migration đã sửa |
  |---|---|---|
  | `TAI_KHOAN.SoDienThoai` | **NOT NULL** (giữ nguyên) | — |
  | `TAI_KHOAN.NgaySinh` | **NULL** | `001_core_identity.sql` |
  | `TAI_KHOAN.GioiTinh` | **NULL** | `001_core_identity.sql` |
  | `TAI_KHOAN.AnhDaiDien` | **NULL** | `001_core_identity.sql` |
  | `KHACH_SAN.MoTa` | **NULL** | `002_hotel_catalog.sql` |
  | `TIEN_NGHI.BieuTuong` | **NULL** | `002_hotel_catalog.sql` |
  | `LOAI_PHONG.MoTa` | **NULL** | `003_room_inventory.sql` |
  | `DANH_GIA.NoiDung` | **NULL** | `006_payment_after_sales.sql` |

- **Đã sửa:** `CREATE TABLE` tương ứng trong 4 migration trên — chỉ đổi `NOT NULL` → `NULL` cho đúng 7 cột trên, không đổi tên cột/datatype/PK/FK nào khác.
- **Backend đã cập nhật để khớp:** `auth.schemas.ts` (registerSchema), `accounts.schemas.ts` (createAccountSchema) — `NgaySinh`/`GioiTinh` chuyển thành optional; `auth.service.ts`/`accounts.service.ts` — `AnhDaiDien` mặc định `null` thay vì `''`; `account-mapper.ts` (`SafeAccount`) — 3 field chuyển kiểu `T | null`.
- **Frontend đã cập nhật để khớp:** `types/auth.ts` (`Account`, `RegisterPayload`), `features/auth/schemas.ts` (form schema), `RegisterPage.tsx` (không bắt buộc Ngày sinh/Giới tính, đánh dấu "(tùy chọn)"), `ProfilePage.tsx`/`AdminAccountDetailPage.tsx` (null-safe khi hiển thị/submit).
- **Verify:** `verify-schema.sql` Check 12 kiểm tra `is_nullable` chính xác cho cả 8 cột (kể cả `SoDienThoai` phải là NOT NULL). `test-constraints.sql` TEST 14–15 (TAI_KHOAN) và TEST 16–19 (KHACH_SAN/LOAI_PHONG/TIEN_NGHI/DANH_GIA) xác nhận NULL được chấp nhận đúng cột, và `SoDienThoai = NULL` vẫn bị từ chối.

### DDI-02: UNIQUE (MaLoaiPhong, NgayApDung) trên QUY_PHONG_GIA — RESOLVED

- **Quyết định chính thức của người dùng:** một loại phòng chỉ được có một bản ghi quỹ phòng/giá cho cùng một ngày áp dụng.
- **Đã thêm:** `CONSTRAINT UQ_QUY_PHONG_GIA_MaLoaiPhong_NgayApDung UNIQUE (MaLoaiPhong, NgayApDung)` trực tiếp vào `CREATE TABLE QUY_PHONG_GIA` trong `database/migrations/003_room_inventory.sql`. Không đổi `PRIMARY KEY (MaQuyPhong)`, không thêm surrogate logic khác.
- **Verify:** `verify-schema.sql` Check 13 xác minh bằng cách đọc thật các cột của unique index (không chỉ dò tên constraint). `test-constraints.sql` TEST 10–13: insert đầu tiên PASS, insert trùng `(MaLoaiPhong, NgayApDung)` FAIL đúng như kỳ vọng, cùng `MaLoaiPhong` khác ngày PASS, khác `MaLoaiPhong` cùng ngày PASS.

---

## Báo cáo cuối task

### 1. Audit trạng thái database ban đầu

- `database/migrations/`, `database/seed/`, `database/scripts/`, `database/docs/` chỉ chứa `.gitkeep` — chưa có DDL/migration/seed nào.
- `backend/prisma/schema.prisma` chỉ có `datasource`/`generator` rỗng (comment ghi rõ sẽ đồng bộ qua `prisma db pull` ở DB-0) — không có model cũ nào cần đối chiếu KEEP/MODIFY/REMOVE/CONFLICT.
- `backend/prisma.config.ts`, `backend/src/config/{database.ts,prisma.ts,env.ts}` đã có sẵn kết nối SQL Server cơ bản, không chứa business logic — không cần chỉnh sửa cho DB-0.
- Không tìm thấy ERD/Chương 6/Chương 7 trong repo lúc bắt đầu; người dùng sau đó chỉ ra vị trí file `database/DATABASE_SOURCE_CHAPTER_6_7.md` (đã có sẵn trong repo nhưng ngoài phạm vi tìm kiếm ban đầu).

### 2. Nguồn thiết kế đã sử dụng

`database/DATABASE_SOURCE_CHAPTER_6_7.md` — trích xuất Chương 6, Chương 7, các override Gate 0 (G0-01 → G0-10) và bảng đối chiếu lệch tên (mục 0.2), theo đúng thứ tự ưu tiên: Gate 0 → ERD chuẩn (ẩn trong override) → Chương 6 → Chương 7.

### 3. Danh sách 22 bảng đã tạo

VAI_TRO, TAI_KHOAN, HO_SO_DOI_TAC, DIA_PHUONG, KHACH_SAN, HINH_ANH_KHACH_SAN, TIEN_NGHI, KHACH_SAN_TIEN_NGHI, LOAI_PHONG, HINH_ANH_LOAI_PHONG, LOAI_PHONG_TIEN_NGHI, QUY_PHONG_GIA, CHINH_SACH_HUY, CHI_TIET_CHINH_SACH_HUY, KHUYEN_MAI, DAT_PHONG, CHI_TIET_DAT_PHONG, THANH_TOAN, HOAN_TIEN, DANH_GIA, HINH_ANH_DANH_GIA, YEU_CAU_HO_TRO — đúng 22/22, xác nhận bằng `verify-schema.sql` (PASS).

### 4. Danh sách migration đã tạo

```
database/migrations/
├── 001_core_identity.sql          (VAI_TRO, TAI_KHOAN, DIA_PHUONG, HO_SO_DOI_TAC)
├── 002_hotel_catalog.sql          (KHACH_SAN, HINH_ANH_KHACH_SAN, TIEN_NGHI, KHACH_SAN_TIEN_NGHI)
├── 003_room_inventory.sql         (LOAI_PHONG, HINH_ANH_LOAI_PHONG, LOAI_PHONG_TIEN_NGHI, QUY_PHONG_GIA)
├── 004_commercial.sql             (CHINH_SACH_HUY, CHI_TIET_CHINH_SACH_HUY, KHUYEN_MAI)
├── 005_booking.sql                (DAT_PHONG, CHI_TIET_DAT_PHONG)
└── 006_payment_after_sales.sql    (THANH_TOAN, HOAN_TIEN, DANH_GIA, HINH_ANH_DANH_GIA, YEU_CAU_HO_TRO)
```

Tất cả thuộc DB-0 baseline (không tách theo phase nghiệp vụ DB-1/DB-2).

### 5. PK đã tạo

22/22 bảng — chi tiết đầy đủ trong `database/docs/constraint-checklist.md` (mục Primary Keys).

### 6. FK đã tạo

30 FK — chi tiết đầy đủ trong `constraint-checklist.md` (mục Foreign Keys). Tất cả dùng `ON DELETE NO ACTION`. 3 FK bị OBSOLETE theo Gate 0 (RB15, RB23, RB31 của Chương 7 7.2) không triển khai, có ghi chú lý do.

### 7. UNIQUE constraints đã tạo

7 UNIQUE constraint tường minh (`VAI_TRO.TenVaiTro`, `TAI_KHOAN.TenDangNhap`, `TAI_KHOAN.Email`, `TIEN_NGHI.TenTienNghi`, `KHUYEN_MAI.MaCode`, `DAT_PHONG.MaXacNhanDatPhong`, `DANH_GIA.MaDatPhong`) + 2 composite PK đóng vai trò UNIQUE (`KHACH_SAN_TIEN_NGHI`, `LOAI_PHONG_TIEN_NGHI`). Không tạo UNIQUE cho `QUY_PHONG_GIA` — xem DDI-02.

### 8. CHECK constraints đã tạo

33 CHECK constraint (xác nhận bằng `verify-schema.sql`), chi tiết trong `constraint-checklist.md`. Không tạo CHECK IN(...) cho các cột trạng thái có miền giá trị mở (ghi "..."); chỉ tạo cho miền giá trị đóng đã liệt kê đủ trong Chương 6.

### 9. Index baseline đã tạo

Chỉ index tự sinh từ PK (22 clustered index) và từ UNIQUE constraint (7 nonclustered unique index) — đúng phạm vi mục 21 (không tối ưu performance sớm, không thêm index tìm kiếm/report).

### 10. Những file đã tạo/chỉnh sửa

Tạo mới:
- `database/docs/data-dictionary.md`
- `database/docs/constraint-checklist.md`
- `database/docs/db0-report.md` (file này)
- `database/migrations/001_core_identity.sql` … `006_payment_after_sales.sql`
- `database/scripts/verify-schema.sql`
- `database/scripts/test-constraints.sql`

Chỉnh sửa:
- `database/README.md` (cập nhật flow Migration → SQL Server → prisma db pull → prisma generate)
- `backend/prisma/schema.prisma` (kết quả của `prisma db pull`, không sửa tay)

Không sửa: bất kỳ file frontend nào, bất kỳ module nghiệp vụ backend nào (controller/service/repository).

Phụ trợ (không commit, đã dọn dẹp): `backend/.env` được tạo cục bộ để trỏ tới `HotelBooking_DB0_Test` phục vụ smoke test (bị `.gitignore` chặn, không vào git); một file `backend/src/db0-smoke-test.ts` tạm dùng để chạy Prisma smoke query đã được xoá sau khi test xong.

### 11. Có thay đổi nào ngoài ERD hay không

**NO.** Toàn bộ 22 bảng, cột, PK, FK bám sát Chương 6/Chương 7 + Gate 0. Không có bảng/cột thứ 23 nào được thêm. Cột duy nhất được thêm ngoài Chương 6 gốc (`HO_SO_DOI_TAC.MaTaiKhoanDuyet`) là do **chính Gate 0 (G0-04) yêu cầu**, không phải tự suy diễn.

### 12. Kết quả chạy migration từ zero

**PASS.** Đã tạo database sạch `HotelBooking_DB0_Test` trên instance SQL Server 2025 cục bộ (MSSQLSERVER, đang chạy) và chạy tuần tự 001→006 bằng `sqlcmd`. Không lỗi, không cần `NOCHECK`, không thao tác thủ công.

### 13. Kết quả verify-schema

**PASS** (sau khi sửa 1 lỗi trong chính script kiểm tra — check FLOAT/REAL ban đầu quét cả bảng hệ thống của SQL Server, đã sửa để chỉ quét bảng người dùng `sys.tables WHERE type='U'`). Toàn bộ 12 nhóm kiểm tra PASS: đủ 22 bảng, không có `KHUYEN_MAI_KHACH_SAN`/`CHI_TIET_GIA_DAT_PHONG`, `CHINH_SACH_HUY` không có `MaDatPhong`, `HO_SO_DOI_TAC` có `MaTaiKhoanDuyet`, FK chính sách hủy đúng, mọi bảng có PK, mọi FK trusted/enabled, UNIQUE chính tồn tại, không có cột FLOAT/REAL, đủ CHECK constraint.

### 14. Kết quả constraint test

**PASS.** `test-constraints.sql` chạy trong 1 transaction luôn ROLLBACK ở cuối (xác nhận bằng truy vấn đếm dòng = 0 sau khi chạy). 9/9 test pass: duplicate UNIQUE, invalid FK, invalid money, invalid quantity, invalid date relation, invalid percentage, out-of-range HangSao, invalid closed-domain status, và 1 test dương tính (insert hợp lệ phải thành công).

### 15. Kết quả prisma db pull

**PASS.** `npx prisma db pull` introspect thành công 22 model từ `HotelBooking_DB0_Test`, ghi vào `backend/prisma/schema.prisma`. Tên bảng/cột Prisma trùng khớp 1:1 với tên vật lý SQL Server (không cần `@map`/`@@map`), đảm bảo traceability đầy đủ.

### 16. Kết quả prisma generate

**PASS.** Prisma Client được generate vào `backend/src/generated/prisma` không lỗi.

### 17. Kết quả backend lint/typecheck/build/test

- `npx tsc --noEmit` → **PASS** (không lỗi).
- `npm run build` (prisma generate + tsc) → **PASS**.
- `npx eslint .` → **PASS** (không lỗi/cảnh báo).
- `npx vitest run` → **PASS** (1 file, 3 test, `health.test.ts`).
- Bổ sung: chạy 1 Prisma smoke query thực tế (`SELECT COUNT(*) FROM VAI_TRO`) qua `PrismaMssql` adapter kết nối `HotelBooking_DB0_Test` → **PASS** (trả về 0 dòng, đúng kỳ vọng trên DB rỗng).

### 18. Các Database Design Issues còn unresolved

**Không còn.** DDI-01 và DDI-02 đã **RESOLVED** — xem "Addendum 2" ở đầu file này để biết quyết định chính thức, migration đã sửa, và kết quả verify/test.

### 19. DB-0 đạt hay chưa đạt Exit Gate

**ĐẠT (PASS)** theo checklist mục 26 của yêu cầu:
- [x] Database trống dựng được hoàn toàn từ migration
- [x] Đúng 22 bảng chính thức
- [x] Không có `KHUYEN_MAI_KHACH_SAN`
- [x] Không có `CHI_TIET_GIA_DAT_PHONG`
- [x] `CHINH_SACH_HUY` không có `MaDatPhong`
- [x] `HO_SO_DOI_TAC` có `MaTaiKhoanDuyet`
- [x] Tên bảng/cột khớp Chương 6/ERD chuẩn
- [x] Không FK nào reference bảng/cột không tồn tại
- [x] PK hợp lệ / FK hợp lệ / UNIQUE hợp lệ / CHECK hợp lệ
- [x] Tiền dùng DECIMAL, không FLOAT
- [x] Migration chạy được từ zero
- [x] verify-schema.sql PASS
- [x] Constraint tests PASS
- [x] prisma db pull PASS
- [x] prisma generate PASS
- [x] backend typecheck PASS
- [x] backend build PASS
- [x] backend DB smoke query PASS (SQL Server có sẵn cục bộ, đã chạy thật — không BLOCKED)

Không mục nào ở trạng thái BLOCKED — SQL Server instance khả dụng cục bộ (MSSQLSERVER, SQL Server 2025 Developer) nên toàn bộ bước xác minh đã chạy thật, không phải giả định.

### 20. Có đủ điều kiện chuyển sang DB-1 / hoàn thành M0 hay chưa

**Đủ điều kiện, không còn điều kiện tiên quyết treo.** DDI-01 và DDI-02 đã RESOLVED trực tiếp trong baseline (xem Addendum 2); M1 (DB-1 seed + BE-1 + FE-1) đã hoàn thành và regression lại thành công sau khi áp dụng cả hai quyết định — xem `docs/m1-report.md`.

---

## Ghi chú vận hành

- Database test `HotelBooking_DB0_Test` được giữ lại trên instance SQL Server cục bộ sau khi hoàn thành (không xoá tự động) — có thể dùng tiếp làm database dev hoặc xoá thủ công nếu không cần.
- `backend/.env` (không commit) hiện trỏ `DATABASE_URL` vào `HotelBooking_DB0_Test` để phục vụ smoke test. Khi bắt đầu phát triển thật, cập nhật `DATABASE_URL` trỏ vào database dev chính thức (chạy lại 001→006 trên database đó trước).
