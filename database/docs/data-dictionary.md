# Data Dictionary — DB-0 Baseline

> Nguồn: `database/DATABASE_SOURCE_CHAPTER_6_7.md` (Chương 6 + Chương 7 + Gate 0 overrides).
> Đây là tài liệu tra cứu chính thức để sinh DDL. Không cột nào trong các bảng dưới đây được thêm ngoài Chương 6 / Gate 0.

## Quy ước áp dụng khi tài liệu gốc không nêu chi tiết implementation

Các quy ước sau là quyết định triển khai (không phải suy diễn cấu trúc), áp dụng thống nhất cho toàn bộ 22 bảng:

1. **Nullable**: một cột là `NULL` **chỉ khi** Chương 6 ghi rõ "Có thể rỗng" ở cột Ghi chú, Gate 0 nêu rõ (ví dụ `HO_SO_DOI_TAC.MaTaiKhoanDuyet`), **hoặc** DDI-01 đã RESOLVED chuyển cột đó sang NULL (xem bảng quyết định bên dưới). Mọi cột khác mặc định `NOT NULL`.

   **DDI-01 (RESOLVED)** — quyết định chính thức của người dùng, áp dụng trực tiếp vào baseline migrations 001–006 (không qua migration 007):

   | Cột | Quyết định |
   |---|---|
   | `TAI_KHOAN.SoDienThoai` | **NOT NULL** (giữ nguyên) |
   | `TAI_KHOAN.NgaySinh` | **NULL** |
   | `TAI_KHOAN.GioiTinh` | **NULL** |
   | `TAI_KHOAN.AnhDaiDien` | **NULL** |
   | `KHACH_SAN.MoTa` | **NULL** |
   | `LOAI_PHONG.MoTa` | **NULL** |
   | `TIEN_NGHI.BieuTuong` | **NULL** |
   | `DANH_GIA.NoiDung` | **NULL** |
2. **Kiểu "Số nguyên" làm khóa chính** → `INT IDENTITY(1,1)` (cơ chế sinh giá trị, không phải cấu trúc mới).
3. **Kiểu "Chuỗi"** → `NVARCHAR(n)` với độ dài chọn theo ngữ nghĩa cột (ghi rõ trong bảng); trường không cần Unicode (mã số, mã giao dịch, số điện thoại, mã xác nhận) → `VARCHAR(n)`.
4. **Kiểu "Văn bản"** → `NVARCHAR(MAX)`.
5. **Kiểu "Số thực" biểu diễn tiền** → `DECIMAL(14,2)` (tuyệt đối không `FLOAT/REAL`).
6. **Kiểu "Số thực" không phải tiền** (diện tích, tỷ lệ %) → `DECIMAL(6,2)` / `DECIMAL(5,2)` tương ứng.
7. **Kiểu "Ngày"** → `DATE`; **"Ngày giờ"** → `DATETIME2`; **"Giờ"** → `TIME`; **"Logic"** → `BIT`.
8. **CHECK cho cột trạng thái/enum**: chỉ tạo khi Chương 6 liệt kê **tập giá trị đóng** (không có "..."). Nếu miền giá trị có "..." (mở), KHÔNG tạo CHECK IN (...) — xem mục 9 trong file nguồn.
9. Không có `DEFAULT` nào được thêm (không `GETDATE()`, không giá trị mặc định trạng thái) vì tài liệu nguồn không xác nhận — đúng theo mục 10 của yêu cầu DB-0.

---

## 1. VAI_TRO

Danh mục vai trò phân quyền tài khoản.

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaVaiTro | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã vai trò |
| TenVaiTro | NVARCHAR(100) | NOT NULL | | | UK | | Tên vai trò, duy nhất |
| MoTa | NVARCHAR(255) | NOT NULL | | | | | Mô tả quyền hạn |

## 2. TAI_KHOAN

Thông tin đăng nhập và hồ sơ cơ bản người dùng.

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaTaiKhoan | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã tài khoản |
| MaVaiTro | INT | NOT NULL | | FK→VAI_TRO | | | Vai trò hiện tại |
| TenDangNhap | NVARCHAR(100) | NOT NULL | | | UK | | Tên đăng nhập |
| Email | NVARCHAR(255) | NOT NULL | | | UK | CK: định dạng email cơ bản | Email đăng nhập |
| MatKhau | NVARCHAR(255) | NOT NULL | | | | CK: LEN(MatKhau) > 0 | Mật khẩu đã băm |
| HoTen | NVARCHAR(150) | NOT NULL | | | | | Họ tên |
| SoDienThoai | VARCHAR(20) | NOT NULL | | | | | Số điện thoại |
| NgaySinh | DATE | NULL | | | | | Ngày sinh (DDI-01 RESOLVED) |
| GioiTinh | NVARCHAR(20) | NULL | | | | | Giới tính (DDI-01 RESOLVED) |
| AnhDaiDien | NVARCHAR(500) | NULL | | | | | Đường dẫn ảnh đại diện (DDI-01 RESOLVED) |
| TrangThai | NVARCHAR(30) | NOT NULL | | | | | Trạng thái tài khoản (miền mở — không CHECK) |
| NgayTao | DATETIME2 | NOT NULL | | | | | Thời điểm tạo |
| NgayCapNhat | DATETIME2 | NOT NULL | | | | CK: NgayCapNhat >= NgayTao | Thời điểm cập nhật gần nhất |

## 3. HO_SO_DOI_TAC

Hồ sơ đăng ký trở thành Chủ khách sạn. Có `MaTaiKhoanDuyet` theo **G0-04**.

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaHoSoDoiTac | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã hồ sơ |
| MaTaiKhoan | INT | NOT NULL | | FK→TAI_KHOAN | | | Tài khoản gửi hồ sơ |
| SoCCCD | VARCHAR(20) | NOT NULL | | | | | Số CCCD |
| SoGiayPhepKinhDoanh | VARCHAR(50) | NOT NULL | | | | | Số giấy phép kinh doanh |
| MaSoThue | VARCHAR(20) | NOT NULL | | | | | Mã số thuế |
| TepGiayTo | NVARCHAR(500) | NOT NULL | | | | | Đường dẫn tệp giấy tờ |
| TrangThaiDuyet | NVARCHAR(20) | NOT NULL | | | | CK IN (N'Chờ duyệt', N'Đã duyệt', N'Từ chối') | Trạng thái xét duyệt (miền đóng) |
| LyDoTuChoi | NVARCHAR(500) | NULL | | | | | Lý do từ chối |
| NgayNop | DATETIME2 | NOT NULL | | | | | Thời điểm nộp |
| NgayDuyet | DATETIME2 | NULL | | | | CK: NgayDuyet IS NULL OR NgayDuyet >= NgayNop | Thời điểm xử lý |
| MaTaiKhoanDuyet | INT | NULL | | FK→TAI_KHOAN | | | Tài khoản quản trị duyệt hồ sơ (G0-04) |

## 4. DIA_PHUONG

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaDiaPhuong | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã địa phương |
| TenThanhPho | NVARCHAR(150) | NOT NULL | | | | | Tên thành phố |
| TenTinh | NVARCHAR(150) | NOT NULL | | | | | Tên tỉnh |
| QuocGia | NVARCHAR(100) | NOT NULL | | | | | Quốc gia |

## 5. KHACH_SAN

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaKhachSan | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã khách sạn |
| MaTaiKhoanSoHuu | INT | NOT NULL | | FK→TAI_KHOAN | | | Chủ sở hữu |
| MaDiaPhuong | INT | NOT NULL | | FK→DIA_PHUONG | | | Địa phương |
| MaTaiKhoanDuyet | INT | NULL | | FK→TAI_KHOAN | | | Tài khoản duyệt (rỗng khi chưa duyệt) |
| TenKhachSan | NVARCHAR(255) | NOT NULL | | | | | Tên khách sạn |
| DiaChiChiTiet | NVARCHAR(500) | NOT NULL | | | | | Địa chỉ cụ thể |
| HangSao | TINYINT | NOT NULL | | | | CK: HangSao BETWEEN 1 AND 5 | Hạng sao |
| MoTa | NVARCHAR(MAX) | NULL | | | | | Giới thiệu (DDI-01 RESOLVED) |
| GioNhanPhong | TIME | NOT NULL | | | | | Giờ nhận phòng |
| GioTraPhong | TIME | NOT NULL | | | | | Giờ trả phòng |
| TrangThai | NVARCHAR(30) | NOT NULL | | | | | Trạng thái (miền mở) |
| NgayDangKy | DATETIME2 | NOT NULL | | | | | Thời điểm đăng ký |
| NgayDuyet | DATETIME2 | NULL | | | | CK: NgayDuyet IS NULL OR NgayDuyet >= NgayDangKy | Thời điểm duyệt |
| NgayCapNhat | DATETIME2 | NOT NULL | | | | CK: NgayCapNhat >= NgayDangKy | Thời điểm cập nhật |

## 6. HINH_ANH_KHACH_SAN

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaHinhAnh | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã hình ảnh |
| MaKhachSan | INT | NOT NULL | | FK→KHACH_SAN | | | Khách sạn sở hữu |
| URL | NVARCHAR(500) | NOT NULL | | | | | Đường dẫn hình ảnh |
| AnhDaiDien | BIT | NOT NULL | | | | | Ảnh đại diện hay không |

## 7. TIEN_NGHI

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaTienNghi | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã tiện nghi |
| TenTienNghi | NVARCHAR(150) | NOT NULL | | | UK | | Tên tiện nghi |
| BieuTuong | NVARCHAR(255) | NULL | | | | | Biểu tượng hiển thị (DDI-01 RESOLVED) |

## 8. KHACH_SAN_TIEN_NGHI (bảng trung gian N-N)

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaKhachSan | INT | NOT NULL | PK (ghép) | FK→KHACH_SAN | | | Khách sạn |
| MaTienNghi | INT | NOT NULL | PK (ghép) | FK→TIEN_NGHI | | | Tiện nghi |

Khóa chính ghép `(MaKhachSan, MaTienNghi)` — không có surrogate ID (đúng thiết kế, không tự thêm).

## 9. LOAI_PHONG

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaLoaiPhong | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã loại phòng |
| MaKhachSan | INT | NOT NULL | | FK→KHACH_SAN | | | Khách sạn sở hữu |
| TenLoaiPhong | NVARCHAR(150) | NOT NULL | | | | | Tên loại phòng |
| SoGiuong | INT | NOT NULL | | | | | Số giường |
| SucChua | INT | NOT NULL | | | | CK: SucChua >= 1 | Sức chứa tối đa |
| DienTich | DECIMAL(6,2) | NOT NULL | | | | CK: DienTich > 0 | Diện tích (m²) |
| LoaiGiuong | NVARCHAR(50) | NOT NULL | | | | | Loại giường |
| MoTa | NVARCHAR(MAX) | NULL | | | | | Mô tả chi tiết (DDI-01 RESOLVED) |
| TrangThai | NVARCHAR(30) | NOT NULL | | | | | Trạng thái kinh doanh (miền mở) |

## 10. HINH_ANH_LOAI_PHONG

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaHinhAnhLoaiPhong | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã hình ảnh loại phòng |
| MaLoaiPhong | INT | NOT NULL | | FK→LOAI_PHONG | | | Loại phòng |
| URL | NVARCHAR(500) | NOT NULL | | | | | Đường dẫn hình ảnh |
| LaAnhDaiDien | BIT | NOT NULL | | | | | Ảnh đại diện hay không |

## 11. LOAI_PHONG_TIEN_NGHI (bảng trung gian N-N)

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaLoaiPhong | INT | NOT NULL | PK (ghép) | FK→LOAI_PHONG | | | Loại phòng |
| MaTienNghi | INT | NOT NULL | PK (ghép) | FK→TIEN_NGHI | | | Tiện nghi |

## 12. QUY_PHONG_GIA

Quỹ phòng mở bán và giá theo ngày.

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaQuyPhong | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã bản ghi quỹ phòng |
| MaLoaiPhong | INT | NOT NULL | | FK→LOAI_PHONG | UK (ghép) | | Loại phòng |
| NgayApDung | DATE | NOT NULL | | | UK (ghép) | | Ngày áp dụng |
| GiaPhong | DECIMAL(14,2) | NOT NULL | | | | CK: GiaPhong >= 0 | Giá phòng trong ngày |
| SoLuongPhong | INT | NOT NULL | | | | CK: SoLuongPhong >= 0 | Số lượng phòng mở bán |
| TrangThai | NVARCHAR(30) | NOT NULL | | | | | Trạng thái kinh doanh (miền mở) |
| | | | | | **UQ_QUY_PHONG_GIA_MaLoaiPhong_NgayApDung** `(MaLoaiPhong, NgayApDung)` | | |

> **DDI-02 (RESOLVED)**: người dùng chốt phương án — một loại phòng chỉ được có một bản ghi quỹ phòng/giá cho cùng một ngày. Đã thêm `UNIQUE (MaLoaiPhong, NgayApDung)` trực tiếp vào `database/migrations/003_room_inventory.sql` (không qua migration 007). Xem `db0-report.md`.

## 13. CHINH_SACH_HUY

**G0-03**: không có `MaDatPhong`. Theo override 0.2, cũng không có `MaKhachSan` — chính sách hủy được mô hình hóa ở mức hệ thống (không gắn 1-1 với khách sạn ở baseline này).

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaChinhSachHuy | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã chính sách hủy |
| TenChinhSach | NVARCHAR(150) | NOT NULL | | | | | Tên chính sách |
| MoTa | NVARCHAR(MAX) | NOT NULL | | | | | Mô tả tổng quát |
| TrangThai | NVARCHAR(30) | NOT NULL | | | | | Trạng thái (miền mở) |
| NgayTao | DATETIME2 | NOT NULL | | | | | Thời điểm tạo |

## 14. CHI_TIET_CHINH_SACH_HUY

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaChiTietChinhSach | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã chi tiết |
| MaChinhSachHuy | INT | NOT NULL | | FK→CHINH_SACH_HUY | | | Chính sách chứa quy định |
| SoGioTruocNhanPhong | INT | NOT NULL | | | | CK: SoGioTruocNhanPhong >= 0 | Số giờ trước nhận phòng |
| TyLeHoanTien | DECIMAL(5,2) | NOT NULL | | | | CK: TyLeHoanTien BETWEEN 0 AND 100 | Tỷ lệ hoàn tiền (%) |

## 15. KHUYEN_MAI

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaKhuyenMai | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã khuyến mãi |
| MaCode | VARCHAR(50) | NOT NULL | | | UK | | Mã nhập khi đặt phòng |
| LoaiGiamGia | NVARCHAR(20) | NOT NULL | | | | CK IN (N'Phần trăm', N'Số tiền cố định') | Phương thức tính giảm giá (miền đóng) |
| GiaTriGiam | DECIMAL(14,2) | NOT NULL | | | | CK: GiaTriGiam > 0 | Giá trị giảm |
| GiaTriDonToiThieu | DECIMAL(14,2) | NOT NULL | | | | CK: GiaTriDonToiThieu >= 0 | Đơn tối thiểu áp dụng |
| MucGiamToiDa | DECIMAL(14,2) | NOT NULL | | | | CK: MucGiamToiDa >= 0 | Mức giảm tối đa |
| SoLuongGioiHan | INT | NOT NULL | | | | CK: SoLuongGioiHan >= 0 | Tổng lượt dùng cho phép |
| NgayBatDau | DATE | NOT NULL | | | | | Ngày bắt đầu |
| NgayKetThuc | DATE | NOT NULL | | | | CK: NgayKetThuc >= NgayBatDau | Ngày kết thúc |
| PhamViApDung | NVARCHAR(20) | NOT NULL | | | | CK IN (N'Toàn hệ thống', N'Theo phạm vi') | Phạm vi áp dụng (miền đóng) |
| TrangThai | NVARCHAR(30) | NOT NULL | | | | | Trạng thái (miền mở) |

> Lưu ý: bảng ánh xạ khuyến mãi ↔ khách sạn (`KHUYEN_MAI_KHACH_SAN`) bị cấm bởi **G0-01**. Cột `PhamViApDung = N'Theo phạm vi'` được giữ lại theo Chương 6 nhưng **không có cơ chế tham chiếu cấp DB** để ràng buộc phạm vi trong baseline này; việc đó sẽ thuộc nghiệp vụ phase sau (không triển khai ở DB-0).

## 16. DAT_PHONG

Bảng trung tâm nghiệp vụ.

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaDatPhong | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã nội bộ đơn đặt phòng |
| MaXacNhanDatPhong | VARCHAR(20) | NOT NULL | | | UK | | Mã xác nhận cho khách |
| MaTaiKhoanKhachHang | INT | NOT NULL | | FK→TAI_KHOAN | | | Khách hàng đặt |
| MaKhachSan | INT | NOT NULL | | FK→KHACH_SAN | | | Khách sạn được đặt |
| MaKhuyenMai | INT | NULL | | FK→KHUYEN_MAI | | | Khuyến mãi áp dụng (rỗng nếu không dùng) |
| MaChinhSachHuy | INT | NOT NULL | | FK→CHINH_SACH_HUY | | | Chính sách hủy áp dụng |
| NgayNhanPhong | DATE | NOT NULL | | | | | Ngày nhận phòng |
| NgayTraPhong | DATE | NOT NULL | | | | CK: NgayTraPhong > NgayNhanPhong | Ngày trả phòng |
| TongTienPhong | DECIMAL(14,2) | NOT NULL | | | | CK: TongTienPhong >= 0 | Tổng tiền phòng trước giảm |
| SoTienGiam | DECIMAL(14,2) | NOT NULL | | | | CK: SoTienGiam >= 0 AND SoTienGiam <= TongTienPhong | Số tiền giảm |
| TongTienThanhToan | DECIMAL(14,2) | NOT NULL | | | | CK: TongTienThanhToan >= 0 AND TongTienThanhToan = TongTienPhong - SoTienGiam | Tổng phải thanh toán |
| GhiChu | NVARCHAR(MAX) | NULL | | | | | Ghi chú của khách (Chương 6 không đánh dấu rỗng minh thị nhưng ghi "Có thể rỗng") |
| TrangThai | NVARCHAR(30) | NOT NULL | | | | | Trạng thái đơn (miền mở) |
| NgayTao | DATETIME2 | NOT NULL | | | | | Thời điểm tạo đơn |
| NgayCapNhat | DATETIME2 | NOT NULL | | | | CK: NgayCapNhat >= NgayTao | Thời điểm cập nhật |

> Không có `TongSoKhach` — cột này chỉ xuất hiện ở Chương 7 (RB15) nhưng không có trong Chương 6 bảng 6.16 (xem override 0.2). RB15/7.3 do đó **không triển khai**.

## 17. CHI_TIET_DAT_PHONG

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaChiTietDatPhong | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã chi tiết đặt phòng |
| MaDatPhong | INT | NOT NULL | | FK→DAT_PHONG | | | Đơn đặt phòng |
| MaLoaiPhong | INT | NOT NULL | | FK→LOAI_PHONG | | | Loại phòng được chọn |
| SoLuongPhong | INT | NOT NULL | | | | CK: SoLuongPhong >= 1 | Số lượng phòng của loại đó |

> `CHI_TIET_GIA_DAT_PHONG` bị cấm bởi **G0-02** — không triển khai bảng này hay bất kỳ FK/CHECK nào tham chiếu tới nó (RB19/RB23 ở 7.1–7.2, RB18 ở 7.3, RB1/RB2/RB4 ở 7.6 → OBSOLETE).

## 18. THANH_TOAN

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaThanhToan | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã giao dịch thanh toán |
| MaDatPhong | INT | NOT NULL | | FK→DAT_PHONG | | | Đơn được thanh toán |
| SoTien | DECIMAL(14,2) | NOT NULL | | | | CK: SoTien > 0 | Số tiền giao dịch |
| PhuongThucThanhToan | NVARCHAR(50) | NOT NULL | | | | | Phương thức (miền mở) |
| MaGiaoDichDoiTac | VARCHAR(100) | NOT NULL | | | | | Mã giao dịch cổng thanh toán |
| TrangThai | NVARCHAR(30) | NOT NULL | | | | | Trạng thái giao dịch (miền mở) |
| ThoiGianGiaoDich | DATETIME2 | NOT NULL | | | | | Thời điểm giao dịch |

## 19. HOAN_TIEN

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaHoanTien | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã hoàn tiền |
| MaThanhToan | INT | NOT NULL | | FK→THANH_TOAN | | | Thanh toán gốc |
| SoTienHoan | DECIMAL(14,2) | NOT NULL | | | | CK: SoTienHoan >= 0 | Số tiền hoàn |
| LyDoHoanTien | NVARCHAR(500) | NOT NULL | | | | | Lý do hoàn tiền |
| MaGiaoDichDoiTac | VARCHAR(100) | NOT NULL | | | | | Mã giao dịch hoàn tiền tại cổng |
| TrangThai | NVARCHAR(30) | NOT NULL | | | | | Trạng thái (miền mở) |
| NgayYeuCau | DATETIME2 | NOT NULL | | | | | Thời điểm yêu cầu |
| NgayHoanTien | DATETIME2 | NULL | | | | CK: NgayHoanTien IS NULL OR NgayHoanTien >= NgayYeuCau | Thời điểm hoàn tất |

## 20. DANH_GIA

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaDanhGia | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã đánh giá |
| MaDatPhong | INT | NOT NULL | | FK→DAT_PHONG | UK | | Đơn làm cơ sở đánh giá (RB26: 1 đơn tối đa 1 đánh giá) |
| MaKhachHang | INT | NOT NULL | | FK→TAI_KHOAN | | | Khách hàng đánh giá |
| MaKhachSan | INT | NOT NULL | | FK→KHACH_SAN | | | Khách sạn được đánh giá |
| DiemDanhGia | TINYINT | NOT NULL | | | | CK: DiemDanhGia BETWEEN 1 AND 5 | Điểm đánh giá |
| NoiDung | NVARCHAR(MAX) | NULL | | | | | Nội dung nhận xét (DDI-01 RESOLVED) |
| TrangThai | NVARCHAR(30) | NOT NULL | | | | | Trạng thái kiểm duyệt (miền mở) |

## 21. HINH_ANH_DANH_GIA

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaHinhAnhDanhGia | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã hình ảnh đánh giá |
| MaDanhGia | INT | NOT NULL | | FK→DANH_GIA | | | Đánh giá chứa hình ảnh |
| URL | NVARCHAR(500) | NOT NULL | | | | | Đường dẫn hình ảnh |

## 22. YEU_CAU_HO_TRO

Không có `MaKhachSan` (không có trong Chương 6 bảng 6.22 — xem override 0.2). Không có actor/module riêng cho CSKH (**G0-09**): `MaTaiKhoanXuLy` tham chiếu thẳng `TAI_KHOAN`.

| Cột | Kiểu SQL Server | Null | PK | FK | Unique | Check | Ý nghĩa |
|---|---|---|---|---|---|---|---|
| MaYeuCauHoTro | INT IDENTITY(1,1) | NOT NULL | PK | | | | Mã yêu cầu |
| MaTaiKhoanKhachHang | INT | NOT NULL | | FK→TAI_KHOAN | | | Khách hàng gửi yêu cầu |
| MaTaiKhoanXuLy | INT | NULL | | FK→TAI_KHOAN | | | Tài khoản xử lý (rỗng khi chưa tiếp nhận) |
| MaDatPhong | INT | NULL | | FK→DAT_PHONG | | | Đơn liên quan (rỗng nếu không liên quan đơn) |
| LoaiYeuCau | NVARCHAR(20) | NOT NULL | | | | CK IN (N'Hỗ trợ', N'Khiếu nại') | Phân loại (miền đóng) |
| TieuDe | NVARCHAR(255) | NOT NULL | | | | | Tiêu đề |
| NoiDung | NVARCHAR(MAX) | NOT NULL | | | | | Nội dung chi tiết |
| KetQuaXuLy | NVARCHAR(MAX) | NULL | | | | | Kết quả/phản hồi |
| TrangThai | NVARCHAR(30) | NOT NULL | | | | | Trạng thái (miền mở) |
| NgayTao | DATETIME2 | NOT NULL | | | | | Thời điểm gửi |
| NgayXuLy | DATETIME2 | NULL | | | | CK: NgayXuLy IS NULL OR NgayXuLy >= NgayTao | Thời điểm xử lý |

---

## Ràng buộc liên bảng (7.6) — KHÔNG triển khai bằng CHECK ở DB-0

Các RB1–RB10 của mục 7.6 (Chương 7) đòi hỏi so sánh dữ liệu **giữa nhiều bảng/nhiều dòng** (ví dụ: tổng tiền đối soát qua CHI_TIET_DAT_PHONG, khuyến mãi còn hiệu lực, quỹ phòng không vượt quá SoLuongPhong...). SQL Server `CHECK CONSTRAINT` chỉ enforce trong phạm vi một dòng của một bảng, nên các ràng buộc này **không thể** hiện thực bằng CHECK. Theo mục 20 của yêu cầu DB-0 ("không viết trigger/SP bừa bãi", DB-0 không implement nghiệp vụ), các RB 7.6 được **ghi nhận** trong `constraint-checklist.md` với trạng thái "Not enforced at DB level (DB-0)" — sẽ được xử lý ở tầng service/business trong các phase sau.
