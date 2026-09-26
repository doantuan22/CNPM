# M8 – Analytics / Admin Report

Covers Promotion admin management (BE-8), Owner analytics (FE-5), Admin analytics/reports (FE-6), and DB-6 (indexes + query optimization audit).

## 0. Audit trước khi triển khai

- `KHUYEN_MAI` đã có sẵn đầy đủ cột (M4 chỉ đọc để áp mã lúc quote/booking, chưa có CRUD admin). Không có `CHECK` domain trên `TrangThai` (chỉ `LoaiGiamGia`/`PhamViApDung` có CK) — thêm `PROMOTION_STATUS.INACTIVE = "Ngừng"` cho hành động "tắt", theo đúng pattern mở-domain đã dùng cho các module trước.
- **Giữ đúng Gate 0 (G0-01):** `KHUYEN_MAI_KHACH_SAN` không tồn tại, nên "Theo phạm vi" không có dữ liệu để thực sự scope theo khách sạn nào. M8 đi xa hơn M4: không chỉ "coi mọi promo là toàn hệ thống" mà **loại hẳn `PhamViApDung`/`TrangThai` khỏi schema tạo mới** — admin không có cách nào gửi lên hai field này, `PhamViApDung` luôn bị server set cứng `"Toàn hệ thống"`, `TrangThai` luôn bắt đầu `"Hoạt động"`.
- `DANH_GIA` **không có cột ngày tạo nào** (`NgayTao`/tương đương) — vì vậy "số liệu theo khoảng thời gian" cho đánh giá là không thể suy chính xác từ schema hiện tại. Theo đúng yêu cầu "chỉ báo cáo các chỉ số có thể suy ra chính xác", `DanhGiaTheoTrangThai` trong Admin Analytics là **toàn thời gian**, không nhận `from`/`to` — ghi rõ trong response và trong UI, không giả vờ có date-range.
- Doanh thu/hoàn tiền được tính **từ trạng thái của chính `THANH_TOAN`/`HOAN_TIEN`** (`TrangThai = "Thành công"`), không suy từ trạng thái `DAT_PHONG` — một booking bị hủy mà chưa từng thanh toán thành công đóng góp 0 vào doanh thu một cách tự nhiên (không có dòng `THANH_TOAN` "Thành công" nào), và một thanh toán thất bại bị loại ngay bởi điều kiện `TrangThai`. Đây là lý do "không tính booking hủy/thanh toán thất bại vào doanh thu" không cần xử lý đặc biệt gì — chỉ cần query đúng bảng, đúng cột trạng thái.
- **Tỷ lệ lấp đầy tính được chính xác** (không phải ước lượng): dùng đúng kỹ thuật M2 (`hotels/availability.ts`) — cắt từng đêm lưu trú của mỗi `CHI_TIET_DAT_PHONG` (đã loại "Đã hủy") vào khoảng `[from, to)`, cộng `SoLuongPhong` theo đêm, chia cho tổng `QUY_PHONG_GIA.SoLuongPhong` "Mở bán" trong đúng khoảng đó. Không có dữ liệu quỹ phòng/giá trong khoảng đã chọn → trả `null` (không phải `0%`, tránh hiểu nhầm "có cấu hình nhưng không bán được").

## 1. Promotion Admin

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/api/admin/promotions` | Admin — filter `TrangThai`/`LoaiGiamGia`, search `MaCode`, paginate |
| GET | `/api/admin/promotions/:id` | Admin — chi tiết kèm `SoLuongDaSuDung` (đếm từ `DAT_PHONG`, loại "Đã hủy") |
| POST | `/api/admin/promotions` | Admin — tạo, luôn `PhamViApDung="Toàn hệ thống"`, `TrangThai="Hoạt động"` |
| PATCH | `/api/admin/promotions/:id` | Admin — cập nhật từng phần, validate lại **kết quả sau khi merge** (không chỉ field vừa gửi) |
| POST | `/api/admin/promotions/:id/activate` | Admin — bật |
| POST | `/api/admin/promotions/:id/deactivate` | Admin — tắt |

Validate (Zod, khớp 1:1 các `CHECK` constraint DB — `004_commercial.sql`): `GiaTriGiam > 0` (và `<= 100` nếu `LoaiGiamGia = "Phần trăm"`, kiểm ở tầng ứng dụng vì DB không giới hạn trên), `GiaTriDonToiThieu/MucGiamToiDa/SoLuongGioiHan >= 0`, `NgayKetThuc >= NgayBatDau`. Cross-field check (ngày, %) tách thành hàm thuần `promotion-validation.ts` dùng chung cho cả tạo và cập nhật — cập nhật một phần (PATCH chỉ gửi 1 field) vẫn được ráp với dữ liệu hiện có rồi validate lại toàn bộ, tránh lọt qua một tổ hợp field không hợp lệ.

## 2. Owner Analytics

`GET /owner/hotels/:id/analytics?from=&to=` — ownership luôn kiểm trước (dùng lại `OwnerHotelsService.getOwnedHotel`, đúng pattern M3: 404 không tồn tại, 403 không phải chủ) **trước khi chạy bất kỳ query thống kê nào**.

| Chỉ số | Nguồn | Ghi chú |
|---|---|---|
| `TongSoBooking`/`BookingTheoTrangThai` | `DAT_PHONG.NgayTao` | Số booking tạo trong khoảng |
| `DoanhThuGop`/`TongHoanTien`/`DoanhThuThucNhan` | `THANH_TOAN.ThoiGianGiaoDich` / `HOAN_TIEN.NgayHoanTien` | Chỉ trạng thái "Thành công"; net = gộp − hoàn |
| `LoaiPhongPhoBien` | `CHI_TIET_DAT_PHONG` (loại "Đã hủy"), theo `NgayTao` | Top 5 theo tổng số phòng đã đặt |
| `TyLeLapDay`/`TongPhongDem`/`TongPhongCoTheBan` | `QUY_PHONG_GIA` + `CHI_TIET_DAT_PHONG` | Theo đêm lưu trú thực tế, xem §0 |

**Ba cột mốc thời gian khác nhau cho ba loại chỉ số** (booking: ngày tạo; tài chính: ngày giao dịch/hoàn tiền; lấp đầy: đêm lưu trú thực) — đây là lựa chọn có chủ đích, không phải không nhất quán: mỗi chỉ số nên gắn với thời điểm nó *thực sự xảy ra* (đặt phòng lúc nào, tiền chuyển lúc nào, khách ở đêm nào), ghi rõ trong `analytics.repository.ts` và trong M8 test (`owner-analytics.test.ts` dùng khoảng ngày rộng để chứng minh cả hai cột cùng lúc).

## 3. Admin Analytics

`GET /admin/analytics?from=&to=` — cùng `AnalyticsRepository` (không lọc `MaKhachSan`) cộng `AdminAnalyticsRepository` cho các chỉ số hệ thống không có scope-theo-khách-sạn: `TongTaiKhoan`/`TaiKhoanTheoVaiTro`, `TongKhachSan`/`KhachSanTheoTrangThai`, `TongGiaoDich`/`ThanhToanTheoTrangThai` (mọi trạng thái, không chỉ thành công), `HoanTienTheoTrangThai`, `DanhGiaTheoTrangThai` (**toàn thời gian**, xem §0), `YeuCauHoTroTheoTrangThai`.

## 4. DB-6 — Indexes

**Phương pháp:** audit thực tế toàn bộ `where`/`orderBy`/`groupBy`/raw SQL trong mọi `*.repository.ts` (M1→M8) trước khi viết bất kỳ index nào — không suy đoán. Trước M8, **schema.prisma không có một `@@index` nào** — SQL Server không tự đánh index cho FK, nên mọi cột khóa ngoại trong toàn hệ thống đều chưa có index. 15 index được thêm (migration `database/migrations/007_indexes.sql`, chỉ `CREATE INDEX`, không đổi bảng/cột nào):

| Bảng | Index | Lý do (query thật) |
|---|---|---|
| DAT_PHONG | `(TrangThai, NgayTao)` | Sweep hết hạn thanh toán (`booking-expiry.ts`) — chạy ở gần như mọi request booking/payment |
| DAT_PHONG | `(TrangThai, NgayTraPhong)` | Sweep hoàn tất lưu trú (`booking-completion.ts`, M7) — điều kiện đánh giá RB9 |
| DAT_PHONG | `(MaTaiKhoanKhachHang, NgayTao DESC)` | `listByCustomer` — mọi lần khách xem "Đặt phòng của tôi" |
| DAT_PHONG | `(MaKhachSan, NgayTao)` | M8: owner/admin analytics theo khách sạn + khoảng ngày |
| DAT_PHONG | `(MaKhuyenMai)` filtered | `countPromotionUsage` — mọi lần áp mã khuyến mãi |
| CHI_TIET_DAT_PHONG | `(MaLoaiPhong)` | Tính availability (M2/M5) + M8 `topRoomTypes` — đường nóng nhất toàn hệ thống |
| LOAI_PHONG | `(MaKhachSan, TrangThai)` | Tra loại phòng theo khách sạn ở hầu hết luồng discovery/booking/owner |
| KHACH_SAN | `(TrangThai)` | Tìm kiếm khách sạn công khai — endpoint traffic cao nhất |
| KHACH_SAN | `(MaTaiKhoanSoHuu, NgayDangKy DESC)` | `listByOwner` — dashboard chủ khách sạn |
| THANH_TOAN | `(MaDatPhong)` | Mọi lần xem chi tiết booking/thanh toán/hủy |
| THANH_TOAN | `(MaGiaoDichDoiTac)` | `findPaymentByTxnRef` (startsWith) — mọi IPN/return-URL VNPAY |
| THANH_TOAN | `(TrangThai, ThoiGianGiaoDich)` | M8: báo cáo doanh thu theo khoảng thời gian |
| HOAN_TIEN | `(MaThanhToan)` | Mọi lần xem chi tiết booking/hủy/thử lại hoàn tiền |
| HOAN_TIEN | `(TrangThai, NgayHoanTien)` | M8: báo cáo hoàn tiền theo khoảng thời gian |
| YEU_CAU_HO_TRO | `(MaTaiKhoanKhachHang, NgayTao DESC)` | `listByCustomer` — mọi lần khách xem "Hỗ trợ & khiếu nại" |

`QUY_PHONG_GIA` **không cần thêm gì** — unique index sẵn có `(MaLoaiPhong, NgayApDung)` đã phục vụ tốt mọi truy vấn thực tế (đã kiểm tra query plan, xem dưới).

**Query plan trước/sau (SQL Server thật, `SET SHOWPLAN_TEXT ON`, tắt/bật lại index để so sánh):**
- `CHI_TIET_DAT_PHONG WHERE MaLoaiPhong = 1`: **Clustered Index Scan** (toàn bảng) → **Index Seek** sau khi có `IX_CHI_TIET_DAT_PHONG_MaLoaiPhong`.
- `THANH_TOAN WHERE MaGiaoDichDoiTac LIKE 'PAYABC123%'`: **Clustered Index Scan** → **Index Seek** (SQL Server tự chuyển `LIKE 'prefix%'` thành `>= 'prefix' AND < 'prefiy'` — xác nhận prefix-LIKE vẫn sargable).
- `DAT_PHONG WHERE TrangThai=N'Chờ thanh toán' AND NgayTao<'2026-01-01'` (đúng câu sweep thật): **Index Seek** trên `IX_DAT_PHONG_TrangThai_NgayTao` ngay khi có index.

Sau khi áp migration, `npx prisma db pull` để đồng bộ `schema.prisma` (đúng workflow "SQL trước, Prisma introspect sau" đã dùng từ M1) — diff chỉ thêm 15 `@@index` (+ `previewFeatures = ["partialIndexes"]` do Prisma tự thêm để biểu diễn index có `WHERE`), không đổi bảng/cột nào.

## 5. Frontend

**Owner:** nút "Xem thống kê" trên `OwnerHotelManagePage` → `OwnerAnalyticsPage` (`/owner/hotels/:id/analytics`) — bộ lọc khoảng ngày, 4 stat tile (booking/doanh thu gộp/hoàn tiền/doanh thu thực nhận), 2 bar-list (booking theo trạng thái — màu khớp badge trạng thái đã dùng ở `BookingDetailPage`; loại phòng phổ biến), 1 khối tỷ lệ lấp đầy (hoặc thông báo "chưa có dữ liệu" khi `null`).

**Admin:** `AdminDashboardPage` thêm 2 thẻ liên kết ("Báo cáo & thống kê", "Quản lý khuyến mãi"). `AdminAnalyticsPage` (`/admin/analytics`) — cùng bộ lọc khoảng ngày, stat tile + 7 bar-list (tài khoản theo vai trò, khách sạn theo trạng thái, booking, thanh toán, hoàn tiền, đánh giá — có chú thích "toàn thời gian", hỗ trợ). `AdminPromotionsPage`/`AdminPromotionFormPage` (`/admin/promotions[/new|/:id]`) — danh sách có filter/search, form tạo/sửa chung một component, nút bật/tắt trên trang sửa.

Biểu đồ dùng `BarList` (thanh ngang tỷ lệ, nhãn trực tiếp) — không thêm thư viện chart mới; giữ đúng design system Tailwind hiện có, màu tái dùng từ badge trạng thái đã có sẵn trong app thay vì bảng màu categorical mới.

## 6. Tests + Live smoke

**Backend — 271/271 PASS** (27 file, gồm 232 cũ từ M1–M7 + **39 test mới**): `promotion-validation.test.ts` (6, unit), `promotions.test.ts` (18, integration — RBAC 401/403, tạo/validate/409 trùng mã, list/search/filter, update + re-validate merged, activate/deactivate, 404), `owner-analytics.test.ts` (9 — 401/403/404/cross-owner 403, revenue không tính booking hủy/thanh toán thất bại, refund làm giảm doanh thu thực nhận đúng, date-range đúng, top room type + tỷ lệ lấp đầy tính đúng, `null` khi không có dữ liệu quỹ phòng), `admin-analytics.test.ts` (6 — RBAC, revenue/refund/date-range hệ thống, đủ breakdown review/support).

**Frontend — 101/101 PASS** (21 file, gồm 81 cũ từ M1–M7 + **20 test mới**): `OwnerAnalyticsPage`, `AdminAnalyticsPage`, `AdminPromotionsPage`, `AdminPromotionFormPage` — mỗi trang có loading/error/empty (khi áp dụng)/thành công, form tạo/sửa/bật-tắt.

**Live smoke (server thật, không qua vitest, script tạm đã xóa sau khi chạy)** — owner đăng nhập thật → `GET owner analytics` cho khách sạn thật (booking + thanh toán fixture qua DB) → đúng doanh thu 2.000.000đ, đúng 1 booking → thử xem khách sạn không tồn tại → 404 → admin đăng nhập thật → `GET admin analytics` (dashboard tổng quan: tổng tài khoản/khách sạn thật) → tạo mã khuyến mãi thật → owner gọi API admin promotions → 403 → tìm kiếm theo mã → cập nhật giá trị giảm → tắt → bật lại → gọi report với khoảng ngày 2000-2010 (không chứa fixture) → đúng 0 booking/0 doanh thu, xác nhận date-range filter hoạt động chính xác trên dữ liệu thật.

## 7. Database schema có thay đổi không

**Chỉ index — không CREATE/ALTER TABLE, không đổi cột nào.** 15 `CREATE INDEX` trong `database/migrations/007_indexes.sql`, đã benchmark query plan trước/sau (xem §4). Không có M8 Design Issue nào cần treo.

## 8. Regression M1–M7

271 test backend cũ (M1–M7) và 101 test frontend cũ đều PASS nguyên sau khi thêm 15 index + module mới — không sửa hành vi bất kỳ API cũ nào.

## 9. M8 kết quả

**PASS** — mọi yêu cầu đều có bằng chứng chạy thật (271 test backend + 101 test frontend + query plan trước/sau thật trên SQL Server + 1 live smoke thật qua server đang chạy), không có hạng mục BLOCKED.

- [x] Promotion Admin: CRUD đầy đủ, giữ đúng Gate 0 (toàn hệ thống, không `KHUYEN_MAI_KHACH_SAN`), validate đủ 6 tiêu chí yêu cầu
- [x] Owner Analytics: booking/doanh thu/doanh thu theo khoảng thời gian/loại phòng phổ biến/tỷ lệ lấp đầy — chỉ dữ liệu khách sạn mình sở hữu, không tính booking hủy/thanh toán thất bại
- [x] Admin Analytics: tài khoản/khách sạn/booking/giao dịch/doanh thu/hoàn tiền/đánh giá/hỗ trợ, có khoảng thời gian ở mọi nơi suy được chính xác
- [x] DB-6: audit thật, 15 index có lý do cụ thể, query plan trước/sau xác nhận scan→seek
- [x] Frontend Owner + Admin đầy đủ loading/error/empty/date-range, giữ design system hiện có
- [x] Backend/Frontend lint + typecheck + build + test PASS
- [x] Live smoke thật: owner → analytics → admin → dashboard → promotion → reports
- [x] Không đổi schema ngoài index, không có Design Issue treo
- [x] Không mở rộng sang security hardening (M9), E2E toàn hệ thống, production deployment (M10)

Đủ điều kiện chuyển sang phase sau.
