/* =====================================================================
   002_demo_data.sql — demo / test dataset (GENERATED — do not edit by hand)
   Source: backend/prisma/demo-seed/build-sql.ts  (npm run seed:demo:sql)
   Images: database/seed/demo/images.lock.json (Cloudinary, folders hotel-booking/hotels|room-types|reviews)

   Prerequisites: migrations 001-007 and database/seed/001_roles.sql.
   Load (the -f 65001 flag is REQUIRED so Vietnamese N'...' literals stay UTF-8):
     sqlcmd -S localhost -U sa -P <password> -d <database> -C -f 65001 -i database/seed/002_demo_data.sql

   Every demo account's password: Demo@123
     Admin:     demo_admin, demo_admin2
     Owners:    demo_owner_minh, demo_owner_lan, demo_owner_hung, demo_owner_thao, demo_owner_khoa
     Customers: demo_kh_an ... demo_kh_tuan  (demo_kh_bikhoa is locked)

   Dates are relative to the day this runs (UTC) and every total is computed
   here from QUY_PHONG_GIA / KHUYEN_MAI / CHI_TIET_CHINH_SACH_HUY. Idempotent:
   re-running inserts nothing twice and only extends the rate calendar.
   ===================================================================== */
SET NOCOUNT ON;
SET XACT_ABORT ON;
-- sqlcmd defaults QUOTED_IDENTIFIER to OFF, but 007_indexes.sql creates filtered
-- indexes, and any INSERT into those tables is rejected without these options.
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON; -- the GhiChu concatenation relies on NULL + text = NULL
SET DATEFIRST 1; -- Monday = 1 → Friday = 5, Saturday = 6 (weekend rate premium)

BEGIN TRY
BEGIN TRANSACTION;

DECLARE @now DATETIME2 = SYSUTCDATETIME();
DECLARE @today DATE = CAST(@now AS DATE);
DECLARE @hash NVARCHAR(255) = N'$2b$12$MAlf8CruNa5GKGgHh1UNreiwyEJtsUmHp8T8YU7rEVU4TT7RyxRpu';

/* ---------------------------------------------------------- roles (same as 001_roles.sql) */
MERGE VAI_TRO AS t
USING (VALUES (N'Khách hàng', N'Người dùng đặt phòng trên nền tảng'),
              (N'Chủ khách sạn', N'Đối tác sở hữu và quản lý khách sạn trên nền tảng'),
              (N'Quản trị hệ thống', N'Quản trị viên vận hành nền tảng')) AS s (TenVaiTro, MoTa)
ON t.TenVaiTro = s.TenVaiTro
WHEN NOT MATCHED THEN INSERT (TenVaiTro, MoTa) VALUES (s.TenVaiTro, s.MoTa);

/* ---------------------------------------------------------- locations & amenities */
INSERT INTO DIA_PHUONG (TenThanhPho, TenTinh, QuocGia)
SELECT s.c, s.p, N'Việt Nam'
FROM (VALUES
    (N'Hồ Chí Minh', N'Hồ Chí Minh'),
    (N'Hà Nội', N'Hà Nội'),
    (N'Đà Nẵng', N'Đà Nẵng'),
    (N'Nha Trang', N'Khánh Hòa'),
    (N'Đà Lạt', N'Lâm Đồng'),
    (N'Hội An', N'Quảng Nam'),
    (N'Phú Quốc', N'Kiên Giang'),
    (N'Hạ Long', N'Quảng Ninh'),
    (N'Sa Pa', N'Lào Cai'),
    (N'Huế', N'Thừa Thiên Huế'),
    (N'Vũng Tàu', N'Bà Rịa - Vũng Tàu')
) AS s (c, p)
WHERE NOT EXISTS (SELECT 1 FROM DIA_PHUONG d WHERE d.TenThanhPho = s.c AND d.TenTinh = s.p);

INSERT INTO TIEN_NGHI (TenTienNghi, BieuTuong)
SELECT s.n, s.i
FROM (VALUES
    (N'Wi-Fi miễn phí', N'wifi'),
    (N'Hồ bơi', N'pool'),
    (N'Bãi đỗ xe', N'parking'),
    (N'Nhà hàng', N'restaurant'),
    (N'Phòng gym', N'gym'),
    (N'Điều hòa nhiệt độ', N'ac'),
    (N'Đưa đón sân bay', N'shuttle'),
    (N'Spa & Massage', N'spa'),
    (N'Bãi biển riêng', N'beach'),
    (N'Quầy bar', N'bar'),
    (N'Lễ tân 24/7', N'reception'),
    (N'Bữa sáng miễn phí', N'breakfast'),
    (N'Ban công', N'balcony'),
    (N'Bồn tắm', N'bathtub'),
    (N'TV màn hình phẳng', N'tv'),
    (N'Minibar', N'minibar'),
    (N'Két sắt an toàn', N'safe'),
    (N'Máy sấy tóc', N'hairdryer'),
    (N'Cho phép thú cưng', N'pet'),
    (N'Khu vui chơi trẻ em', N'kids')
) AS s (n, i)
WHERE NOT EXISTS (SELECT 1 FROM TIEN_NGHI t WHERE t.TenTienNghi = s.n);

/* ---------------------------------------------------------- cancellation policy (backend uses the oldest active one) */
IF NOT EXISTS (SELECT 1 FROM CHINH_SACH_HUY WHERE TrangThai = N'Hoạt động')
BEGIN
    INSERT INTO CHINH_SACH_HUY (TenChinhSach, MoTa, TrangThai, NgayTao)
    VALUES (N'Hủy linh hoạt', N'Hủy trước 48 giờ hoàn 100%, trước 24 giờ hoàn 50%, sau đó không hoàn tiền.', N'Hoạt động', @now);
    DECLARE @newPolicy INT = SCOPE_IDENTITY();
    INSERT INTO CHI_TIET_CHINH_SACH_HUY (MaChinhSachHuy, SoGioTruocNhanPhong, TyLeHoanTien)
    VALUES (@newPolicy, 48, 100), (@newPolicy, 24, 50), (@newPolicy, 0, 0);
END;
DECLARE @policy INT = (SELECT TOP 1 MaChinhSachHuy FROM CHINH_SACH_HUY WHERE TrangThai = N'Hoạt động' ORDER BY MaChinhSachHuy);

/* ---------------------------------------------------------- accounts */
CREATE TABLE #acc (u NVARCHAR(100) PRIMARY KEY, name NVARCHAR(150), role NVARCHAR(100), status NVARCHAR(30), born DATE NULL, gender NVARCHAR(20) NULL, phone VARCHAR(20), ageDays INT);
INSERT INTO #acc VALUES
    (N'demo_admin', N'Nguyễn Hoàng Quân', N'Quản trị hệ thống', N'Hoạt động', '1988-03-12', N'Nam', '0917919117', 720),
    (N'demo_admin2', N'Trịnh Mai Anh', N'Quản trị hệ thống', N'Hoạt động', '1992-11-02', N'Nữ', '0925838234', 540),
    (N'demo_owner_minh', N'Trần Quang Minh', N'Chủ khách sạn', N'Hoạt động', '1980-06-21', N'Nam', '0933757351', 650),
    (N'demo_owner_lan', N'Lê Thị Ngọc Lan', N'Chủ khách sạn', N'Hoạt động', '1984-09-15', N'Nữ', '0941676468', 640),
    (N'demo_owner_hung', N'Phạm Văn Hùng', N'Chủ khách sạn', N'Hoạt động', '1976-01-30', N'Nam', '0949595585', 610),
    (N'demo_owner_thao', N'Võ Thu Thảo', N'Chủ khách sạn', N'Hoạt động', '1987-12-08', N'Nữ', '0957514702', 590),
    (N'demo_owner_khoa', N'Đặng Minh Khoa', N'Chủ khách sạn', N'Hoạt động', '1990-04-19', N'Nam', '0965433819', 560),
    (N'demo_kh_an', N'Nguyễn Văn An', N'Khách hàng', N'Hoạt động', '1975-01-01', N'Nam', '0973352936', 480),
    (N'demo_kh_binh', N'Trần Thị Bình', N'Khách hàng', N'Hoạt động', '1982-06-12', N'Nữ', '0981272053', 460),
    (N'demo_kh_cuong', N'Lê Minh Cường', N'Khách hàng', N'Hoạt động', '1989-11-23', N'Nam', '0989191170', 440),
    (N'demo_kh_dung', N'Phạm Thùy Dung', N'Khách hàng', N'Hoạt động', '1996-04-07', N'Nữ', '0997110287', 420),
    (N'demo_kh_giang', N'Hoàng Hương Giang', N'Khách hàng', N'Hoạt động', '1977-09-18', N'Nữ', '0915029405', 400),
    (N'demo_kh_hai', N'Vũ Đức Hải', N'Khách hàng', N'Hoạt động', NULL, N'Nam', '0922948522', 380),
    (N'demo_kh_hanh', N'Đỗ Mỹ Hạnh', N'Khách hàng', N'Hoạt động', '1991-07-13', N'Nữ', '0930867639', 360),
    (N'demo_kh_hieu', N'Bùi Trung Hiếu', N'Khách hàng', N'Hoạt động', '1998-12-24', N'Nam', '0938786756', 340),
    (N'demo_kh_huong', N'Ngô Thu Hương', N'Khách hàng', N'Hoạt động', '1979-05-08', N'Nữ', '0946705873', 320),
    (N'demo_kh_khanh', N'Dương Quốc Khánh', N'Khách hàng', N'Hoạt động', '1986-10-19', N'Nam', '0954624990', 300),
    (N'demo_kh_linh', N'Lý Khánh Linh', N'Khách hàng', N'Hoạt động', '1993-03-03', N'Nữ', '0962544107', 280),
    (N'demo_kh_long', N'Mai Thành Long', N'Khách hàng', N'Hoạt động', NULL, N'Nam', '0970463224', 260),
    (N'demo_kh_mai', N'Hồ Tuyết Mai', N'Khách hàng', N'Hoạt động', '1981-01-25', N'Nữ', '0978382341', 240),
    (N'demo_kh_nam', N'Đinh Hoài Nam', N'Khách hàng', N'Hoạt động', '1988-06-09', N'Nam', '0986301458', 220),
    (N'demo_kh_ngoc', N'Tạ Bảo Ngọc', N'Khách hàng', N'Hoạt động', '1995-11-20', N'Nữ', '0994220575', 200),
    (N'demo_kh_phong', N'Châu Gia Phong', N'Khách hàng', N'Hoạt động', '1976-04-04', N'Nam', '0912139693', 180),
    (N'demo_kh_quynh', N'Lâm Như Quỳnh', N'Khách hàng', N'Hoạt động', '1983-09-15', N'Nữ', '0920058810', 160),
    (N'demo_kh_son', N'Kiều Thanh Sơn', N'Khách hàng', N'Hoạt động', NULL, N'Nam', '0927977927', 140),
    (N'demo_kh_trang', N'Phan Huyền Trang', N'Khách hàng', N'Hoạt động', '1997-07-10', N'Nữ', '0935897044', 120),
    (N'demo_kh_tuan', N'Cao Anh Tuấn', N'Khách hàng', N'Hoạt động', '1978-12-21', N'Nam', '0943816161', 100),
    (N'demo_kh_bikhoa', N'Trương Minh Tâm', N'Khách hàng', N'Khóa', '1995-07-07', N'Nam', '0951735278', 300);

INSERT INTO TAI_KHOAN (MaVaiTro, TenDangNhap, Email, MatKhau, HoTen, SoDienThoai, NgaySinh, GioiTinh, AnhDaiDien, TrangThai, NgayTao, NgayCapNhat)
SELECT r.MaVaiTro, a.u, a.u + N'@example.com', @hash, a.name, a.phone, a.born, a.gender, NULL, a.status,
       DATEADD(DAY, -a.ageDays, @now), DATEADD(DAY, -a.ageDays, @now)
FROM #acc a JOIN VAI_TRO r ON r.TenVaiTro = a.role
WHERE NOT EXISTS (SELECT 1 FROM TAI_KHOAN t WHERE t.TenDangNhap = a.u);

DECLARE @admin INT = (SELECT MaTaiKhoan FROM TAI_KHOAN WHERE TenDangNhap = N'demo_admin');
DECLARE @admin2 INT = (SELECT MaTaiKhoan FROM TAI_KHOAN WHERE TenDangNhap = N'demo_admin2');

/* ---------------------------------------------------------- partner applications (UC03 / UC32) */
INSERT INTO HO_SO_DOI_TAC (MaTaiKhoan, SoCCCD, SoGiayPhepKinhDoanh, MaSoThue, TepGiayTo, TrangThaiDuyet, LyDoTuChoi, NgayNop, NgayDuyet, MaTaiKhoanDuyet)
SELECT t.MaTaiKhoan, s.cccd, s.gp, s.mst, s.tep, s.st, s.reason,
       CASE WHEN s.st = N'Chờ duyệt' THEN DATEADD(DAY, -s.i, @now) ELSE DATEADD(DAY, 1, t.NgayTao) END,
       CASE WHEN s.st = N'Chờ duyệt' THEN NULL ELSE DATEADD(DAY, 3, t.NgayTao) END,
       CASE WHEN s.st = N'Chờ duyệt' THEN NULL ELSE @admin END
FROM (VALUES
    (N'demo_owner_minh', '079100000000', 'GP-410000', '3100000000', N'https://example.com/partner-docs/demo_owner_minh.pdf', N'Đã duyệt', NULL, 1),
    (N'demo_owner_lan', '079101234567', 'GP-410037', '3100097531', N'https://example.com/partner-docs/demo_owner_lan.pdf', N'Đã duyệt', NULL, 2),
    (N'demo_owner_hung', '079102469134', 'GP-410074', '3100195062', N'https://example.com/partner-docs/demo_owner_hung.pdf', N'Đã duyệt', NULL, 3),
    (N'demo_owner_thao', '079103703701', 'GP-410111', '3100292593', N'https://example.com/partner-docs/demo_owner_thao.pdf', N'Đã duyệt', NULL, 4),
    (N'demo_owner_khoa', '079104938268', 'GP-410148', '3100390124', N'https://example.com/partner-docs/demo_owner_khoa.pdf', N'Đã duyệt', NULL, 5),
    (N'demo_kh_ngoc', '079106172835', 'GP-410185', '3100487655', N'https://example.com/partner-docs/demo_kh_ngoc.pdf', N'Chờ duyệt', NULL, 6),
    (N'demo_kh_phong', '079107407402', 'GP-410222', '3100585186', N'https://example.com/partner-docs/demo_kh_phong.pdf', N'Chờ duyệt', NULL, 7),
    (N'demo_kh_son', '079108641969', 'GP-410259', '3100682717', N'https://example.com/partner-docs/demo_kh_son.pdf', N'Chờ duyệt', NULL, 8),
    (N'demo_kh_long', '079109876536', 'GP-410296', '3100780248', N'https://example.com/partner-docs/demo_kh_long.pdf', N'Từ chối', N'Giấy phép kinh doanh đã hết hạn và mã số thuế không khớp với thông tin đăng ký. Vui lòng bổ sung bản cập nhật.', 9)
) AS s (u, cccd, gp, mst, tep, st, reason, i)
JOIN TAI_KHOAN t ON t.TenDangNhap = s.u
WHERE NOT EXISTS (SELECT 1 FROM HO_SO_DOI_TAC h WHERE h.MaTaiKhoan = t.MaTaiKhoan AND h.SoGiayPhepKinhDoanh = s.gp);

/* ---------------------------------------------------------- hotels */
CREATE TABLE #hotel (k VARCHAR(10) PRIMARY KEY, name NVARCHAR(255), owner NVARCHAR(100), city NVARCHAR(150), province NVARCHAR(150), addr NVARCHAR(500), stars TINYINT, descr NVARCHAR(MAX), ci TIME, co TIME, status NVARCHAR(30), ageDays INT, id INT NULL);
INSERT INTO #hotel (k, name, owner, city, province, addr, stars, descr, ci, co, status, ageDays) VALUES
    (N'H01', N'Lotus Central Hotel Sài Gòn', N'demo_owner_minh', N'Hồ Chí Minh', N'Hồ Chí Minh', N'68 Lê Thánh Tôn, Phường Bến Nghé, Quận 1', 4, N'Khách sạn 4 sao ngay trung tâm Quận 1, cách chợ Bến Thành 5 phút đi bộ, phù hợp cho cả du lịch và công tác.', '14:00', '12:00', N'Hoạt động', 520),
    (N'H02', N'Bến Thành Garden Residence', N'demo_owner_minh', N'Hồ Chí Minh', N'Hồ Chí Minh', N'15 Lý Tự Trọng, Quận 1', 3, N'Căn hộ dịch vụ yên tĩnh giữa lòng thành phố, có bếp nhỏ và khu vườn trên sân thượng.', '14:00', '12:00', N'Hoạt động', 470),
    (N'H03', N'Thảo Điền Riverside Villa', N'demo_owner_lan', N'Hồ Chí Minh', N'Hồ Chí Minh', N'21 Nguyễn Văn Hưởng, Thảo Điền, TP. Thủ Đức', 5, N'Khu biệt thự ven sông Sài Gòn với hồ bơi vô cực, spa và nhà hàng Pháp.', '15:00', '11:00', N'Hoạt động', 430),
    (N'H04', N'Hồ Gươm Heritage Hotel', N'demo_owner_hung', N'Hà Nội', N'Hà Nội', N'12 Hàng Khay, Quận Hoàn Kiếm', 4, N'Tòa nhà kiến trúc Pháp cổ nhìn ra hồ Hoàn Kiếm, gần phố cổ và nhà hát lớn.', '14:00', '12:00', N'Hoạt động', 500),
    (N'H05', N'Tây Hồ Lakeview Suites', N'demo_owner_hung', N'Hà Nội', N'Hà Nội', N'88 Xuân Diệu, Quận Tây Hồ', 5, N'Căn suite cao cấp nhìn ra Hồ Tây, hồ bơi trong nhà và quầy bar trên tầng thượng.', '14:00', '12:00', N'Hoạt động', 450),
    (N'H06', N'Phố Cổ Cozy Inn', N'demo_owner_hung', N'Hà Nội', N'Hà Nội', N'45 Hàng Bạc, Quận Hoàn Kiếm', 2, N'Nhà nghỉ nhỏ giá tốt ngay trong khu phố cổ, thuận tiện khám phá ẩm thực đường phố.', '14:00', '12:00', N'Hoạt động', 380),
    (N'H07', N'Mỹ Khê Ocean Pearl Resort', N'demo_owner_lan', N'Đà Nẵng', N'Đà Nẵng', N'255 Võ Nguyên Giáp, Quận Ngũ Hành Sơn', 5, N'Resort 5 sao sát bãi biển Mỹ Khê với bãi tắm riêng, hồ bơi vô cực và câu lạc bộ trẻ em.', '15:00', '12:00', N'Hoạt động', 490),
    (N'H08', N'Sông Hàn Skyline Hotel', N'demo_owner_lan', N'Đà Nẵng', N'Đà Nẵng', N'36 Bạch Đằng, Quận Hải Châu', 4, N'Khách sạn bên bờ sông Hàn, ngắm cầu Rồng phun lửa từ quầy bar tầng thượng.', '14:00', '12:00', N'Hoạt động', 400),
    (N'H09', N'Sơn Trà Green Retreat', N'demo_owner_khoa', N'Đà Nẵng', N'Đà Nẵng', N'Đường Hoàng Sa, Bán đảo Sơn Trà', 4, N'Khu nghỉ dưỡng sinh thái trên bán đảo Sơn Trà — đang chờ quản trị viên phê duyệt.', '14:00', '12:00', N'Chờ duyệt', 12),
    (N'H10', N'Nha Trang Bay Horizon', N'demo_owner_thao', N'Nha Trang', N'Khánh Hòa', N'72 Trần Phú, Lộc Thọ', 4, N'Khách sạn đối diện biển Trần Phú, hồ bơi tầng thượng nhìn toàn cảnh vịnh Nha Trang.', '14:00', '12:00', N'Hoạt động', 470),
    (N'H11', N'Vịnh Xanh Beach Resort', N'demo_owner_thao', N'Nha Trang', N'Khánh Hòa', N'Bãi Dài, Cam Lâm', 5, N'Resort biệt lập trên Bãi Dài với villa hồ bơi riêng và dịch vụ đưa đón sân bay Cam Ranh.', '14:00', '12:00', N'Hoạt động', 440),
    (N'H12', N'Đồi Thông Pine Hill Villa', N'demo_owner_khoa', N'Đà Lạt', N'Lâm Đồng', N'9 Trần Hưng Đạo, Phường 10', 3, N'Biệt thự Pháp giữa đồi thông, lò sưởi và khu vườn hoa cẩm tú cầu.', '14:00', '12:00', N'Hoạt động', 420),
    (N'H13', N'Langbiang Garden Lodge', N'demo_owner_khoa', N'Đà Lạt', N'Lâm Đồng', N'3 Nguyễn Du, Phường 9', 4, N'Nhà nghỉ vườn yên tĩnh, bữa sáng với rau và dâu tây từ nông trại của khách sạn.', '14:00', '12:00', N'Hoạt động', 360),
    (N'H14', N'Hoài River Heritage Hotel', N'demo_owner_lan', N'Hội An', N'Quảng Nam', N'101 Bạch Đằng, Phường Minh An', 4, N'Khách sạn phong cách nhà cổ bên sông Hoài, đi bộ 3 phút đến Chùa Cầu.', '14:00', '12:00', N'Hoạt động', 410),
    (N'H15', N'An Bàng Coconut Homestay', N'demo_owner_lan', N'Hội An', N'Quảng Nam', N'Thôn An Bàng, Cẩm An', 3, N'Homestay giữa rặng dừa, cách biển An Bàng 200m, có xe đạp miễn phí.', '14:00', '12:00', N'Hoạt động', 330),
    (N'H16', N'Dương Đông Sunset Resort', N'demo_owner_thao', N'Phú Quốc', N'Kiên Giang', N'118 Trần Hưng Đạo, Dương Đông', 5, N'Resort bãi Trường ngắm hoàng hôn đẹp nhất đảo, quầy bar trên cát và spa thảo dược.', '15:00', '12:00', N'Hoạt động', 390),
    (N'H17', N'Hàm Ninh Fishing Village Lodge', N'demo_owner_thao', N'Phú Quốc', N'Kiên Giang', N'Làng chài Hàm Ninh', 3, N'Nhà nghỉ làng chài — đang bị quản trị viên đình chỉ do nhiều khiếu nại về vệ sinh.', '14:00', '12:00', N'Đình chỉ', 300),
    (N'H18', N'Hạ Long Bay View Hotel', N'demo_owner_minh', N'Hạ Long', N'Quảng Ninh', N'9 Hạ Long, Bãi Cháy', 4, N'Tầm nhìn trọn vịnh Hạ Long, gần bến tàu du thuyền và cáp treo Nữ Hoàng.', '14:00', '12:00', N'Hoạt động', 350),
    (N'H19', N'Sa Pa Cloud Valley Lodge', N'demo_owner_khoa', N'Sa Pa', N'Lào Cai', N'27 Mường Hoa, Thị xã Sa Pa', 3, N'Nhà nghỉ trên sườn đồi nhìn thung lũng Mường Hoa, bồn tắm lá thuốc người Dao đỏ.', '14:00', '12:00', N'Hoạt động', 320),
    (N'H20', N'Kinh Thành Imperial Hotel', N'demo_owner_hung', N'Huế', N'Thừa Thiên Huế', N'5 Lê Lợi, Phường Vĩnh Ninh', 4, N'Khách sạn bên sông Hương — chủ khách sạn đã ngừng kinh doanh, lịch sử đặt phòng được giữ lại.', '14:00', '12:00', N'Ngừng hoạt động', 600),
    (N'H21', N'Bãi Sau Seaside Hotel', N'demo_owner_minh', N'Vũng Tàu', N'Bà Rịa - Vũng Tàu', N'160 Thùy Vân, Phường 8', 3, N'Khách sạn đối diện Bãi Sau, phù hợp cho chuyến đi cuối tuần từ TP. Hồ Chí Minh.', '14:00', '12:00', N'Hoạt động', 300);

INSERT INTO KHACH_SAN (MaTaiKhoanSoHuu, MaDiaPhuong, MaTaiKhoanDuyet, TenKhachSan, DiaChiChiTiet, HangSao, MoTa, GioNhanPhong, GioTraPhong, TrangThai, NgayDangKy, NgayDuyet, NgayCapNhat)
SELECT o.MaTaiKhoan, d.MaDiaPhuong,
       CASE WHEN h.status = N'Chờ duyệt' THEN NULL ELSE @admin END,
       h.name, h.addr, h.stars, h.descr, h.ci, h.co, h.status,
       DATEADD(DAY, -h.ageDays, @now),
       CASE WHEN h.status = N'Chờ duyệt' THEN NULL ELSE DATEADD(DAY, -h.ageDays + 2, @now) END,
       CASE WHEN h.status = N'Chờ duyệt' THEN DATEADD(DAY, -h.ageDays, @now) ELSE DATEADD(DAY, -h.ageDays + 2, @now) END
FROM #hotel h
JOIN TAI_KHOAN o ON o.TenDangNhap = h.owner
JOIN DIA_PHUONG d ON d.TenThanhPho = h.city AND d.TenTinh = h.province
WHERE NOT EXISTS (SELECT 1 FROM KHACH_SAN k WHERE k.TenKhachSan = h.name);

UPDATE h SET id = k.MaKhachSan FROM #hotel h JOIN KHACH_SAN k ON k.TenKhachSan = h.name;

INSERT INTO HINH_ANH_KHACH_SAN (MaKhachSan, URL, AnhDaiDien)
SELECT h.id, s.url, s.cover
FROM (VALUES
    (N'H01', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511816/hotel-booking/hotels/demo-exterior-01.jpg', 1),
    (N'H01', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511899/hotel-booking/hotels/demo-lobby-01.jpg', 0),
    (N'H01', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511816/hotel-booking/hotels/demo-exterior-02.jpg', 0),
    (N'H01', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511908/hotel-booking/hotels/demo-restaurant-01.jpg', 0),
    (N'H02', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511816/hotel-booking/hotels/demo-exterior-03.jpg', 1),
    (N'H02', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511898/hotel-booking/hotels/demo-lobby-02.jpg', 0),
    (N'H02', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511816/hotel-booking/hotels/demo-exterior-04.jpg', 0),
    (N'H02', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511909/hotel-booking/hotels/demo-restaurant-02.jpg', 0),
    (N'H03', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511818/hotel-booking/hotels/demo-exterior-05.jpg', 1),
    (N'H03', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511899/hotel-booking/hotels/demo-lobby-03.jpg', 0),
    (N'H03', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511831/hotel-booking/hotels/demo-pool-01.jpg', 0),
    (N'H03', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511910/hotel-booking/hotels/demo-restaurant-03.jpg', 0),
    (N'H04', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511818/hotel-booking/hotels/demo-exterior-06.jpg', 1),
    (N'H04', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511900/hotel-booking/hotels/demo-lobby-04.jpg', 0),
    (N'H04', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511818/hotel-booking/hotels/demo-exterior-07.jpg', 0),
    (N'H04', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511909/hotel-booking/hotels/demo-restaurant-04.jpg', 0),
    (N'H05', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511818/hotel-booking/hotels/demo-exterior-08.jpg', 1),
    (N'H05', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511904/hotel-booking/hotels/demo-lobby-05.jpg', 0),
    (N'H05', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511831/hotel-booking/hotels/demo-pool-02.jpg', 0),
    (N'H05', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511909/hotel-booking/hotels/demo-restaurant-05.jpg', 0),
    (N'H06', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511819/hotel-booking/hotels/demo-exterior-09.jpg', 1),
    (N'H06', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511901/hotel-booking/hotels/demo-lobby-06.jpg', 0),
    (N'H06', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511819/hotel-booking/hotels/demo-exterior-10.jpg', 0),
    (N'H06', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511910/hotel-booking/hotels/demo-restaurant-06.jpg', 0),
    (N'H07', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511819/hotel-booking/hotels/demo-exterior-11.jpg', 1),
    (N'H07', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511903/hotel-booking/hotels/demo-lobby-07.jpg', 0),
    (N'H07', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511832/hotel-booking/hotels/demo-pool-03.jpg', 0),
    (N'H07', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511911/hotel-booking/hotels/demo-restaurant-07.jpg', 0),
    (N'H08', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511819/hotel-booking/hotels/demo-exterior-12.jpg', 1),
    (N'H08', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511903/hotel-booking/hotels/demo-lobby-08.jpg', 0),
    (N'H08', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511834/hotel-booking/hotels/demo-pool-04.jpg', 0),
    (N'H08', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511911/hotel-booking/hotels/demo-restaurant-08.jpg', 0),
    (N'H09', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511820/hotel-booking/hotels/demo-exterior-13.jpg', 1),
    (N'H09', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511907/hotel-booking/hotels/demo-lobby-09.jpg', 0),
    (N'H09', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511833/hotel-booking/hotels/demo-pool-05.jpg', 0),
    (N'H09', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511911/hotel-booking/hotels/demo-restaurant-09.jpg', 0),
    (N'H10', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511820/hotel-booking/hotels/demo-exterior-14.jpg', 1),
    (N'H10', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511904/hotel-booking/hotels/demo-lobby-10.jpg', 0),
    (N'H10', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511833/hotel-booking/hotels/demo-pool-06.jpg', 0),
    (N'H10', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511912/hotel-booking/hotels/demo-restaurant-10.jpg', 0),
    (N'H11', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511820/hotel-booking/hotels/demo-exterior-15.jpg', 1),
    (N'H11', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511905/hotel-booking/hotels/demo-lobby-11.jpg', 0),
    (N'H11', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511834/hotel-booking/hotels/demo-pool-07.jpg', 0),
    (N'H11', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511912/hotel-booking/hotels/demo-restaurant-11.jpg', 0),
    (N'H12', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511821/hotel-booking/hotels/demo-exterior-16.jpg', 1),
    (N'H12', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511906/hotel-booking/hotels/demo-lobby-12.jpg', 0),
    (N'H12', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511822/hotel-booking/hotels/demo-exterior-17.jpg', 0),
    (N'H12', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511912/hotel-booking/hotels/demo-restaurant-12.jpg', 0),
    (N'H13', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511822/hotel-booking/hotels/demo-exterior-18.jpg', 1),
    (N'H13', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511907/hotel-booking/hotels/demo-lobby-13.jpg', 0),
    (N'H13', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511823/hotel-booking/hotels/demo-exterior-19.jpg', 0),
    (N'H13', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511913/hotel-booking/hotels/demo-restaurant-13.jpg', 0),
    (N'H14', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511823/hotel-booking/hotels/demo-exterior-20.jpg', 1),
    (N'H14', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511906/hotel-booking/hotels/demo-lobby-14.jpg', 0),
    (N'H14', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511836/hotel-booking/hotels/demo-pool-08.jpg', 0),
    (N'H14', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511913/hotel-booking/hotels/demo-restaurant-14.jpg', 0),
    (N'H15', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511823/hotel-booking/hotels/demo-exterior-21.jpg', 1),
    (N'H15', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511908/hotel-booking/hotels/demo-lobby-15.jpg', 0),
    (N'H15', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511824/hotel-booking/hotels/demo-exterior-22.jpg', 0),
    (N'H15', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511913/hotel-booking/hotels/demo-restaurant-15.jpg', 0),
    (N'H16', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511824/hotel-booking/hotels/demo-exterior-23.jpg', 1),
    (N'H16', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511899/hotel-booking/hotels/demo-lobby-01.jpg', 0),
    (N'H16', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511836/hotel-booking/hotels/demo-pool-09.jpg', 0),
    (N'H16', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511914/hotel-booking/hotels/demo-restaurant-16.jpg', 0),
    (N'H17', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511824/hotel-booking/hotels/demo-exterior-24.jpg', 1),
    (N'H17', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511898/hotel-booking/hotels/demo-lobby-02.jpg', 0),
    (N'H17', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511824/hotel-booking/hotels/demo-exterior-25.jpg', 0),
    (N'H17', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511914/hotel-booking/hotels/demo-restaurant-17.jpg', 0),
    (N'H18', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511825/hotel-booking/hotels/demo-exterior-26.jpg', 1),
    (N'H18', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511899/hotel-booking/hotels/demo-lobby-03.jpg', 0),
    (N'H18', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511837/hotel-booking/hotels/demo-pool-10.jpg', 0),
    (N'H18', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511915/hotel-booking/hotels/demo-restaurant-18.jpg', 0),
    (N'H19', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511826/hotel-booking/hotels/demo-exterior-27.jpg', 1),
    (N'H19', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511900/hotel-booking/hotels/demo-lobby-04.jpg', 0),
    (N'H19', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511826/hotel-booking/hotels/demo-exterior-28.jpg', 0),
    (N'H19', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511908/hotel-booking/hotels/demo-restaurant-01.jpg', 0),
    (N'H20', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511826/hotel-booking/hotels/demo-exterior-29.jpg', 1),
    (N'H20', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511904/hotel-booking/hotels/demo-lobby-05.jpg', 0),
    (N'H20', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511837/hotel-booking/hotels/demo-pool-11.jpg', 0),
    (N'H20', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511909/hotel-booking/hotels/demo-restaurant-02.jpg', 0),
    (N'H21', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511827/hotel-booking/hotels/demo-exterior-30.jpg', 1),
    (N'H21', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511901/hotel-booking/hotels/demo-lobby-06.jpg', 0),
    (N'H21', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511838/hotel-booking/hotels/demo-pool-12.jpg', 0),
    (N'H21', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511910/hotel-booking/hotels/demo-restaurant-03.jpg', 0)
) AS s (k, url, cover)
JOIN #hotel h ON h.k = s.k
WHERE NOT EXISTS (SELECT 1 FROM HINH_ANH_KHACH_SAN i WHERE i.MaKhachSan = h.id AND i.URL = s.url);

INSERT INTO KHACH_SAN_TIEN_NGHI (MaKhachSan, MaTienNghi)
SELECT h.id, t.MaTienNghi
FROM (VALUES
    (N'H01', N'Wi-Fi miễn phí'),
    (N'H01', N'Nhà hàng'),
    (N'H01', N'Phòng gym'),
    (N'H01', N'Lễ tân 24/7'),
    (N'H01', N'Quầy bar'),
    (N'H01', N'Bãi đỗ xe'),
    (N'H02', N'Wi-Fi miễn phí'),
    (N'H02', N'Bữa sáng miễn phí'),
    (N'H02', N'Lễ tân 24/7'),
    (N'H02', N'Bãi đỗ xe'),
    (N'H03', N'Wi-Fi miễn phí'),
    (N'H03', N'Hồ bơi'),
    (N'H03', N'Spa & Massage'),
    (N'H03', N'Nhà hàng'),
    (N'H03', N'Quầy bar'),
    (N'H03', N'Đưa đón sân bay'),
    (N'H03', N'Cho phép thú cưng'),
    (N'H04', N'Wi-Fi miễn phí'),
    (N'H04', N'Nhà hàng'),
    (N'H04', N'Lễ tân 24/7'),
    (N'H04', N'Bữa sáng miễn phí'),
    (N'H04', N'Đưa đón sân bay'),
    (N'H05', N'Wi-Fi miễn phí'),
    (N'H05', N'Hồ bơi'),
    (N'H05', N'Phòng gym'),
    (N'H05', N'Spa & Massage'),
    (N'H05', N'Nhà hàng'),
    (N'H05', N'Quầy bar'),
    (N'H06', N'Wi-Fi miễn phí'),
    (N'H06', N'Lễ tân 24/7'),
    (N'H07', N'Wi-Fi miễn phí'),
    (N'H07', N'Hồ bơi'),
    (N'H07', N'Bãi biển riêng'),
    (N'H07', N'Spa & Massage'),
    (N'H07', N'Nhà hàng'),
    (N'H07', N'Quầy bar'),
    (N'H07', N'Khu vui chơi trẻ em'),
    (N'H07', N'Đưa đón sân bay'),
    (N'H08', N'Wi-Fi miễn phí'),
    (N'H08', N'Hồ bơi'),
    (N'H08', N'Nhà hàng'),
    (N'H08', N'Quầy bar'),
    (N'H08', N'Phòng gym'),
    (N'H09', N'Wi-Fi miễn phí'),
    (N'H09', N'Hồ bơi'),
    (N'H09', N'Spa & Massage'),
    (N'H10', N'Wi-Fi miễn phí'),
    (N'H10', N'Hồ bơi'),
    (N'H10', N'Nhà hàng'),
    (N'H10', N'Quầy bar'),
    (N'H10', N'Bữa sáng miễn phí'),
    (N'H11', N'Wi-Fi miễn phí'),
    (N'H11', N'Hồ bơi'),
    (N'H11', N'Bãi biển riêng'),
    (N'H11', N'Spa & Massage'),
    (N'H11', N'Nhà hàng'),
    (N'H11', N'Đưa đón sân bay'),
    (N'H11', N'Khu vui chơi trẻ em'),
    (N'H12', N'Wi-Fi miễn phí'),
    (N'H12', N'Bãi đỗ xe'),
    (N'H12', N'Bữa sáng miễn phí'),
    (N'H12', N'Cho phép thú cưng'),
    (N'H13', N'Wi-Fi miễn phí'),
    (N'H13', N'Nhà hàng'),
    (N'H13', N'Spa & Massage'),
    (N'H13', N'Bãi đỗ xe'),
    (N'H14', N'Wi-Fi miễn phí'),
    (N'H14', N'Hồ bơi'),
    (N'H14', N'Nhà hàng'),
    (N'H14', N'Bữa sáng miễn phí'),
    (N'H14', N'Đưa đón sân bay'),
    (N'H15', N'Wi-Fi miễn phí'),
    (N'H15', N'Bữa sáng miễn phí'),
    (N'H15', N'Bãi đỗ xe'),
    (N'H15', N'Cho phép thú cưng'),
    (N'H16', N'Wi-Fi miễn phí'),
    (N'H16', N'Hồ bơi'),
    (N'H16', N'Bãi biển riêng'),
    (N'H16', N'Spa & Massage'),
    (N'H16', N'Nhà hàng'),
    (N'H16', N'Quầy bar'),
    (N'H16', N'Đưa đón sân bay'),
    (N'H17', N'Wi-Fi miễn phí'),
    (N'H17', N'Nhà hàng'),
    (N'H18', N'Wi-Fi miễn phí'),
    (N'H18', N'Hồ bơi'),
    (N'H18', N'Nhà hàng'),
    (N'H18', N'Quầy bar'),
    (N'H18', N'Bãi đỗ xe'),
    (N'H19', N'Wi-Fi miễn phí'),
    (N'H19', N'Nhà hàng'),
    (N'H19', N'Bữa sáng miễn phí'),
    (N'H19', N'Spa & Massage'),
    (N'H20', N'Wi-Fi miễn phí'),
    (N'H20', N'Nhà hàng'),
    (N'H20', N'Hồ bơi'),
    (N'H21', N'Wi-Fi miễn phí'),
    (N'H21', N'Hồ bơi'),
    (N'H21', N'Bãi đỗ xe'),
    (N'H21', N'Nhà hàng')
) AS s (k, amenity)
JOIN #hotel h ON h.k = s.k
JOIN TIEN_NGHI t ON t.TenTienNghi = s.amenity
WHERE NOT EXISTS (SELECT 1 FROM KHACH_SAN_TIEN_NGHI x WHERE x.MaKhachSan = h.id AND x.MaTienNghi = t.MaTienNghi);

/* ---------------------------------------------------------- room types */
CREATE TABLE #room (k VARCHAR(12) PRIMARY KEY, hk VARCHAR(10), name NVARCHAR(150), beds INT, cap INT, area DECIMAL(6,2), bed NVARCHAR(50), descr NVARCHAR(MAX), status NVARCHAR(30), price DECIMAL(14,2), inv INT, id INT NULL);
INSERT INTO #room (k, hk, name, beds, cap, area, bed, descr, status, price, inv) VALUES
    (N'H01-R1', N'H01', N'Phòng Superior', 1, 2, 24, N'Giường đôi', N'Phòng tiêu chuẩn ấm cúng với giường đôi, bàn làm việc và phòng tắm vòi sen.', N'Hoạt động', 1200000, 10),
    (N'H01-R2', N'H01', N'Phòng Deluxe', 1, 2, 32, N'Giường King', N'Phòng rộng rãi với giường King, ban công riêng và minibar.', N'Hoạt động', 1620000, 8),
    (N'H01-R3', N'H01', N'Suite', 1, 3, 60, N'Giường King', N'Suite có phòng khách riêng, bồn tắm và tầm nhìn đẹp nhất của khách sạn.', N'Hoạt động', 3000000, 3),
    (N'H02-R1', N'H02', N'Phòng Superior', 1, 2, 24, N'Giường đôi', N'Phòng tiêu chuẩn ấm cúng với giường đôi, bàn làm việc và phòng tắm vòi sen.', N'Hoạt động', 700000, 10),
    (N'H02-R2', N'H02', N'Phòng Twin', 2, 2, 28, N'Giường đơn', N'Hai giường đơn riêng biệt, phù hợp cho bạn bè hoặc đồng nghiệp đi công tác.', N'Hoạt động', 740000, 8),
    (N'H02-R3', N'H02', N'Phòng Gia Đình', 2, 4, 42, N'Giường đôi + giường đơn', N'Không gian cho gia đình 4 người với một giường đôi và hai giường đơn.', N'Hoạt động', 1190000, 6),
    (N'H03-R1', N'H03', N'Phòng Deluxe Hướng Biển', 1, 2, 32, N'Giường King', N'Phòng rộng rãi với giường King, ban công riêng và minibar.', N'Hoạt động', 2970000, 8),
    (N'H03-R2', N'H03', N'Suite Hướng Biển', 1, 3, 60, N'Giường King', N'Suite có phòng khách riêng, bồn tắm và tầm nhìn đẹp nhất của khách sạn.', N'Hoạt động', 5500000, 3),
    (N'H03-R3', N'H03', N'Villa Hồ Bơi Riêng', 3, 6, 120, N'2 giường King + 1 giường đơn', N'Biệt thự riêng với hồ bơi, sân vườn và bếp nhỏ cho nhóm 6 khách.', N'Hoạt động', 8800000, 3),
    (N'H04-R1', N'H04', N'Phòng Superior', 1, 2, 24, N'Giường đôi', N'Phòng tiêu chuẩn ấm cúng với giường đôi, bàn làm việc và phòng tắm vòi sen.', N'Hoạt động', 1200000, 10),
    (N'H04-R2', N'H04', N'Phòng Twin', 2, 2, 28, N'Giường đơn', N'Hai giường đơn riêng biệt, phù hợp cho bạn bè hoặc đồng nghiệp đi công tác.', N'Hoạt động', 1260000, 8),
    (N'H04-R3', N'H04', N'Phòng Deluxe', 1, 2, 32, N'Giường King', N'Phòng rộng rãi với giường King, ban công riêng và minibar.', N'Hoạt động', 1620000, 8),
    (N'H04-R4', N'H04', N'Phòng Gia Đình', 2, 4, 42, N'Giường đôi + giường đơn', N'Không gian cho gia đình 4 người với một giường đôi và hai giường đơn.', N'Ngừng bán', 2040000, 6),
    (N'H05-R1', N'H05', N'Phòng Deluxe', 1, 2, 32, N'Giường King', N'Phòng rộng rãi với giường King, ban công riêng và minibar.', N'Hoạt động', 2970000, 8),
    (N'H05-R2', N'H05', N'Suite', 1, 3, 60, N'Giường King', N'Suite có phòng khách riêng, bồn tắm và tầm nhìn đẹp nhất của khách sạn.', N'Hoạt động', 5500000, 3),
    (N'H05-R3', N'H05', N'Phòng Gia Đình', 2, 4, 42, N'Giường đôi + giường đơn', N'Không gian cho gia đình 4 người với một giường đôi và hai giường đơn.', N'Hoạt động', 3740000, 6),
    (N'H06-R1', N'H06', N'Phòng Superior', 1, 2, 24, N'Giường đôi', N'Phòng tiêu chuẩn ấm cúng với giường đôi, bàn làm việc và phòng tắm vòi sen.', N'Hoạt động', 450000, 10),
    (N'H06-R2', N'H06', N'Phòng Twin', 2, 2, 28, N'Giường đơn', N'Hai giường đơn riêng biệt, phù hợp cho bạn bè hoặc đồng nghiệp đi công tác.', N'Hoạt động', 470000, 8),
    (N'H07-R1', N'H07', N'Phòng Deluxe Hướng Biển', 1, 2, 32, N'Giường King', N'Phòng rộng rãi với giường King, ban công riêng và minibar.', N'Hoạt động', 2970000, 8),
    (N'H07-R2', N'H07', N'Phòng Gia Đình', 2, 4, 42, N'Giường đôi + giường đơn', N'Không gian cho gia đình 4 người với một giường đôi và hai giường đơn.', N'Hoạt động', 3740000, 6),
    (N'H07-R3', N'H07', N'Suite Hướng Biển', 1, 3, 60, N'Giường King', N'Suite có phòng khách riêng, bồn tắm và tầm nhìn đẹp nhất của khách sạn.', N'Hoạt động', 5500000, 2),
    (N'H07-R4', N'H07', N'Villa Hồ Bơi Riêng', 3, 6, 120, N'2 giường King + 1 giường đơn', N'Biệt thự riêng với hồ bơi, sân vườn và bếp nhỏ cho nhóm 6 khách.', N'Hoạt động', 8800000, 3),
    (N'H08-R1', N'H08', N'Phòng Superior', 1, 2, 24, N'Giường đôi', N'Phòng tiêu chuẩn ấm cúng với giường đôi, bàn làm việc và phòng tắm vòi sen.', N'Hoạt động', 1200000, 10),
    (N'H08-R2', N'H08', N'Phòng Deluxe', 1, 2, 32, N'Giường King', N'Phòng rộng rãi với giường King, ban công riêng và minibar.', N'Hoạt động', 1620000, 8),
    (N'H08-R3', N'H08', N'Phòng Twin', 2, 2, 28, N'Giường đơn', N'Hai giường đơn riêng biệt, phù hợp cho bạn bè hoặc đồng nghiệp đi công tác.', N'Hoạt động', 1260000, 8),
    (N'H09-R1', N'H09', N'Phòng Deluxe Hướng Biển', 1, 2, 32, N'Giường King', N'Phòng rộng rãi với giường King, ban công riêng và minibar.', N'Hoạt động', 1620000, 8),
    (N'H09-R2', N'H09', N'Villa Hồ Bơi Riêng', 3, 6, 120, N'2 giường King + 1 giường đơn', N'Biệt thự riêng với hồ bơi, sân vườn và bếp nhỏ cho nhóm 6 khách.', N'Hoạt động', 4800000, 3),
    (N'H10-R1', N'H10', N'Phòng Superior', 1, 2, 24, N'Giường đôi', N'Phòng tiêu chuẩn ấm cúng với giường đôi, bàn làm việc và phòng tắm vòi sen.', N'Hoạt động', 1200000, 10),
    (N'H10-R2', N'H10', N'Phòng Deluxe', 1, 2, 32, N'Giường King', N'Phòng rộng rãi với giường King, ban công riêng và minibar.', N'Hoạt động', 1620000, 8),
    (N'H10-R3', N'H10', N'Phòng Gia Đình', 2, 4, 42, N'Giường đôi + giường đơn', N'Không gian cho gia đình 4 người với một giường đôi và hai giường đơn.', N'Hoạt động', 2040000, 6),
    (N'H11-R1', N'H11', N'Phòng Deluxe Hướng Biển', 1, 2, 32, N'Giường King', N'Phòng rộng rãi với giường King, ban công riêng và minibar.', N'Hoạt động', 2970000, 8),
    (N'H11-R2', N'H11', N'Suite Hướng Biển', 1, 3, 60, N'Giường King', N'Suite có phòng khách riêng, bồn tắm và tầm nhìn đẹp nhất của khách sạn.', N'Hoạt động', 5500000, 3),
    (N'H11-R3', N'H11', N'Villa Hồ Bơi Riêng', 3, 6, 120, N'2 giường King + 1 giường đơn', N'Biệt thự riêng với hồ bơi, sân vườn và bếp nhỏ cho nhóm 6 khách.', N'Hoạt động', 8800000, 3),
    (N'H12-R1', N'H12', N'Phòng Superior', 1, 2, 24, N'Giường đôi', N'Phòng tiêu chuẩn ấm cúng với giường đôi, bàn làm việc và phòng tắm vòi sen.', N'Hoạt động', 700000, 10),
    (N'H12-R2', N'H12', N'Phòng Gia Đình', 2, 4, 42, N'Giường đôi + giường đơn', N'Không gian cho gia đình 4 người với một giường đôi và hai giường đơn.', N'Hoạt động', 1190000, 6),
    (N'H13-R1', N'H13', N'Phòng Superior', 1, 2, 24, N'Giường đôi', N'Phòng tiêu chuẩn ấm cúng với giường đôi, bàn làm việc và phòng tắm vòi sen.', N'Hoạt động', 1200000, 10),
    (N'H13-R2', N'H13', N'Phòng Deluxe', 1, 2, 32, N'Giường King', N'Phòng rộng rãi với giường King, ban công riêng và minibar.', N'Hoạt động', 1620000, 8),
    (N'H13-R3', N'H13', N'Suite', 1, 3, 60, N'Giường King', N'Suite có phòng khách riêng, bồn tắm và tầm nhìn đẹp nhất của khách sạn.', N'Hoạt động', 3000000, 3),
    (N'H14-R1', N'H14', N'Phòng Superior', 1, 2, 24, N'Giường đôi', N'Phòng tiêu chuẩn ấm cúng với giường đôi, bàn làm việc và phòng tắm vòi sen.', N'Hoạt động', 1200000, 10),
    (N'H14-R2', N'H14', N'Phòng Deluxe', 1, 2, 32, N'Giường King', N'Phòng rộng rãi với giường King, ban công riêng và minibar.', N'Hoạt động', 1620000, 8),
    (N'H14-R3', N'H14', N'Phòng Gia Đình', 2, 4, 42, N'Giường đôi + giường đơn', N'Không gian cho gia đình 4 người với một giường đôi và hai giường đơn.', N'Hoạt động', 2040000, 6),
    (N'H15-R1', N'H15', N'Phòng Vườn Dừa', 1, 2, 24, N'Giường đôi', N'Phòng tiêu chuẩn ấm cúng với giường đôi, bàn làm việc và phòng tắm vòi sen.', N'Hoạt động', 700000, 10),
    (N'H15-R2', N'H15', N'Phòng Gia Đình', 2, 4, 42, N'Giường đôi + giường đơn', N'Không gian cho gia đình 4 người với một giường đôi và hai giường đơn.', N'Hoạt động', 1190000, 6),
    (N'H16-R1', N'H16', N'Phòng Deluxe Hướng Biển', 1, 2, 32, N'Giường King', N'Phòng rộng rãi với giường King, ban công riêng và minibar.', N'Hoạt động', 2970000, 8),
    (N'H16-R2', N'H16', N'Phòng Gia Đình', 2, 4, 42, N'Giường đôi + giường đơn', N'Không gian cho gia đình 4 người với một giường đôi và hai giường đơn.', N'Hoạt động', 3740000, 6),
    (N'H16-R3', N'H16', N'Villa Hồ Bơi Riêng', 3, 6, 120, N'2 giường King + 1 giường đơn', N'Biệt thự riêng với hồ bơi, sân vườn và bếp nhỏ cho nhóm 6 khách.', N'Hoạt động', 8800000, 3),
    (N'H17-R1', N'H17', N'Phòng Superior', 1, 2, 24, N'Giường đôi', N'Phòng tiêu chuẩn ấm cúng với giường đôi, bàn làm việc và phòng tắm vòi sen.', N'Hoạt động', 700000, 10),
    (N'H17-R2', N'H17', N'Phòng Twin', 2, 2, 28, N'Giường đơn', N'Hai giường đơn riêng biệt, phù hợp cho bạn bè hoặc đồng nghiệp đi công tác.', N'Hoạt động', 740000, 8),
    (N'H18-R1', N'H18', N'Phòng Superior', 1, 2, 24, N'Giường đôi', N'Phòng tiêu chuẩn ấm cúng với giường đôi, bàn làm việc và phòng tắm vòi sen.', N'Hoạt động', 1200000, 10),
    (N'H18-R2', N'H18', N'Phòng Deluxe', 1, 2, 32, N'Giường King', N'Phòng rộng rãi với giường King, ban công riêng và minibar.', N'Hoạt động', 1620000, 8),
    (N'H18-R3', N'H18', N'Phòng Gia Đình', 2, 4, 42, N'Giường đôi + giường đơn', N'Không gian cho gia đình 4 người với một giường đôi và hai giường đơn.', N'Hoạt động', 2040000, 6),
    (N'H19-R1', N'H19', N'Phòng Superior', 1, 2, 24, N'Giường đôi', N'Phòng tiêu chuẩn ấm cúng với giường đôi, bàn làm việc và phòng tắm vòi sen.', N'Hoạt động', 700000, 10),
    (N'H19-R2', N'H19', N'Phòng Deluxe', 1, 2, 32, N'Giường King', N'Phòng rộng rãi với giường King, ban công riêng và minibar.', N'Hoạt động', 950000, 8),
    (N'H19-R3', N'H19', N'Phòng Gia Đình', 2, 4, 42, N'Giường đôi + giường đơn', N'Không gian cho gia đình 4 người với một giường đôi và hai giường đơn.', N'Hoạt động', 1190000, 6),
    (N'H20-R1', N'H20', N'Phòng Superior', 1, 2, 24, N'Giường đôi', N'Phòng tiêu chuẩn ấm cúng với giường đôi, bàn làm việc và phòng tắm vòi sen.', N'Hoạt động', 1200000, 10),
    (N'H20-R2', N'H20', N'Phòng Deluxe', 1, 2, 32, N'Giường King', N'Phòng rộng rãi với giường King, ban công riêng và minibar.', N'Hoạt động', 1620000, 8),
    (N'H21-R1', N'H21', N'Phòng Superior', 1, 2, 24, N'Giường đôi', N'Phòng tiêu chuẩn ấm cúng với giường đôi, bàn làm việc và phòng tắm vòi sen.', N'Hoạt động', 700000, 10),
    (N'H21-R2', N'H21', N'Phòng Twin', 2, 2, 28, N'Giường đơn', N'Hai giường đơn riêng biệt, phù hợp cho bạn bè hoặc đồng nghiệp đi công tác.', N'Hoạt động', 740000, 8),
    (N'H21-R3', N'H21', N'Phòng Gia Đình', 2, 4, 42, N'Giường đôi + giường đơn', N'Không gian cho gia đình 4 người với một giường đôi và hai giường đơn.', N'Hoạt động', 1190000, 6);

INSERT INTO LOAI_PHONG (MaKhachSan, TenLoaiPhong, SoGiuong, SucChua, DienTich, LoaiGiuong, MoTa, TrangThai)
SELECT h.id, r.name, r.beds, r.cap, r.area, r.bed, r.descr, r.status
FROM #room r JOIN #hotel h ON h.k = r.hk
WHERE NOT EXISTS (SELECT 1 FROM LOAI_PHONG l WHERE l.MaKhachSan = h.id AND l.TenLoaiPhong = r.name);

UPDATE r SET id = l.MaLoaiPhong FROM #room r JOIN #hotel h ON h.k = r.hk JOIN LOAI_PHONG l ON l.MaKhachSan = h.id AND l.TenLoaiPhong = r.name;

INSERT INTO HINH_ANH_LOAI_PHONG (MaLoaiPhong, URL, LaAnhDaiDien)
SELECT r.id, s.url, s.cover
FROM (VALUES
    (N'H01-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511915/hotel-booking/room-types/demo-room-01.jpg', 1),
    (N'H01-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511915/hotel-booking/room-types/demo-room-02.jpg', 0),
    (N'H01-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511916/hotel-booking/room-types/demo-room-03.jpg', 1),
    (N'H01-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-04.jpg', 0),
    (N'H01-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511916/hotel-booking/room-types/demo-room-05.jpg', 1),
    (N'H01-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511916/hotel-booking/room-types/demo-room-06.jpg', 0),
    (N'H02-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-07.jpg', 1),
    (N'H02-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-08.jpg', 0),
    (N'H02-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-09.jpg', 1),
    (N'H02-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511918/hotel-booking/room-types/demo-room-10.jpg', 0),
    (N'H02-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511918/hotel-booking/room-types/demo-room-11.jpg', 1),
    (N'H02-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511919/hotel-booking/room-types/demo-room-12.jpg', 0),
    (N'H03-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511919/hotel-booking/room-types/demo-room-13.jpg', 1),
    (N'H03-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511919/hotel-booking/room-types/demo-room-14.jpg', 0),
    (N'H03-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511920/hotel-booking/room-types/demo-room-15.jpg', 1),
    (N'H03-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511920/hotel-booking/room-types/demo-room-16.jpg', 0),
    (N'H03-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-17.jpg', 1),
    (N'H03-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-18.jpg', 0),
    (N'H04-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511951/hotel-booking/room-types/demo-room-19.jpg', 1),
    (N'H04-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-20.jpg', 0),
    (N'H04-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-21.jpg', 1),
    (N'H04-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511922/hotel-booking/room-types/demo-room-22.jpg', 0),
    (N'H04-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511922/hotel-booking/room-types/demo-room-23.jpg', 1),
    (N'H04-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511923/hotel-booking/room-types/demo-room-24.jpg', 0),
    (N'H04-R4', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511923/hotel-booking/room-types/demo-room-25.jpg', 1),
    (N'H04-R4', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511923/hotel-booking/room-types/demo-room-26.jpg', 0),
    (N'H05-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511924/hotel-booking/room-types/demo-room-27.jpg', 1),
    (N'H05-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511924/hotel-booking/room-types/demo-room-28.jpg', 0),
    (N'H05-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511925/hotel-booking/room-types/demo-room-29.jpg', 1),
    (N'H05-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511925/hotel-booking/room-types/demo-room-30.jpg', 0),
    (N'H05-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511925/hotel-booking/room-types/demo-room-31.jpg', 1),
    (N'H05-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511926/hotel-booking/room-types/demo-room-32.jpg', 0),
    (N'H06-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511926/hotel-booking/room-types/demo-room-33.jpg', 1),
    (N'H06-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511926/hotel-booking/room-types/demo-room-34.jpg', 0),
    (N'H06-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511927/hotel-booking/room-types/demo-room-35.jpg', 1),
    (N'H06-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511927/hotel-booking/room-types/demo-room-36.jpg', 0),
    (N'H07-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511927/hotel-booking/room-types/demo-room-37.jpg', 1),
    (N'H07-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511928/hotel-booking/room-types/demo-room-38.jpg', 0),
    (N'H07-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511928/hotel-booking/room-types/demo-room-39.jpg', 1),
    (N'H07-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511928/hotel-booking/room-types/demo-room-40.jpg', 0),
    (N'H07-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511915/hotel-booking/room-types/demo-room-01.jpg', 1),
    (N'H07-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511915/hotel-booking/room-types/demo-room-02.jpg', 0),
    (N'H07-R4', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511916/hotel-booking/room-types/demo-room-03.jpg', 1),
    (N'H07-R4', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-04.jpg', 0),
    (N'H08-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511916/hotel-booking/room-types/demo-room-05.jpg', 1),
    (N'H08-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511916/hotel-booking/room-types/demo-room-06.jpg', 0),
    (N'H08-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-07.jpg', 1),
    (N'H08-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-08.jpg', 0),
    (N'H08-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-09.jpg', 1),
    (N'H08-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511918/hotel-booking/room-types/demo-room-10.jpg', 0),
    (N'H09-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511918/hotel-booking/room-types/demo-room-11.jpg', 1),
    (N'H09-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511919/hotel-booking/room-types/demo-room-12.jpg', 0),
    (N'H09-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511919/hotel-booking/room-types/demo-room-13.jpg', 1),
    (N'H09-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511919/hotel-booking/room-types/demo-room-14.jpg', 0),
    (N'H10-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511920/hotel-booking/room-types/demo-room-15.jpg', 1),
    (N'H10-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511920/hotel-booking/room-types/demo-room-16.jpg', 0),
    (N'H10-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-17.jpg', 1),
    (N'H10-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-18.jpg', 0),
    (N'H10-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511951/hotel-booking/room-types/demo-room-19.jpg', 1),
    (N'H10-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-20.jpg', 0),
    (N'H11-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-21.jpg', 1),
    (N'H11-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511922/hotel-booking/room-types/demo-room-22.jpg', 0),
    (N'H11-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511922/hotel-booking/room-types/demo-room-23.jpg', 1),
    (N'H11-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511923/hotel-booking/room-types/demo-room-24.jpg', 0),
    (N'H11-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511923/hotel-booking/room-types/demo-room-25.jpg', 1),
    (N'H11-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511923/hotel-booking/room-types/demo-room-26.jpg', 0),
    (N'H12-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511924/hotel-booking/room-types/demo-room-27.jpg', 1),
    (N'H12-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511924/hotel-booking/room-types/demo-room-28.jpg', 0),
    (N'H12-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511925/hotel-booking/room-types/demo-room-29.jpg', 1),
    (N'H12-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511925/hotel-booking/room-types/demo-room-30.jpg', 0),
    (N'H13-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511925/hotel-booking/room-types/demo-room-31.jpg', 1),
    (N'H13-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511926/hotel-booking/room-types/demo-room-32.jpg', 0),
    (N'H13-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511926/hotel-booking/room-types/demo-room-33.jpg', 1),
    (N'H13-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511926/hotel-booking/room-types/demo-room-34.jpg', 0),
    (N'H13-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511927/hotel-booking/room-types/demo-room-35.jpg', 1),
    (N'H13-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511927/hotel-booking/room-types/demo-room-36.jpg', 0),
    (N'H14-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511927/hotel-booking/room-types/demo-room-37.jpg', 1),
    (N'H14-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511928/hotel-booking/room-types/demo-room-38.jpg', 0),
    (N'H14-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511928/hotel-booking/room-types/demo-room-39.jpg', 1),
    (N'H14-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511928/hotel-booking/room-types/demo-room-40.jpg', 0),
    (N'H14-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511915/hotel-booking/room-types/demo-room-01.jpg', 1),
    (N'H14-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511915/hotel-booking/room-types/demo-room-02.jpg', 0),
    (N'H15-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511916/hotel-booking/room-types/demo-room-03.jpg', 1),
    (N'H15-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-04.jpg', 0),
    (N'H15-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511916/hotel-booking/room-types/demo-room-05.jpg', 1),
    (N'H15-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511916/hotel-booking/room-types/demo-room-06.jpg', 0),
    (N'H16-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-07.jpg', 1),
    (N'H16-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-08.jpg', 0),
    (N'H16-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-09.jpg', 1),
    (N'H16-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511918/hotel-booking/room-types/demo-room-10.jpg', 0),
    (N'H16-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511918/hotel-booking/room-types/demo-room-11.jpg', 1),
    (N'H16-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511919/hotel-booking/room-types/demo-room-12.jpg', 0),
    (N'H17-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511919/hotel-booking/room-types/demo-room-13.jpg', 1),
    (N'H17-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511919/hotel-booking/room-types/demo-room-14.jpg', 0),
    (N'H17-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511920/hotel-booking/room-types/demo-room-15.jpg', 1),
    (N'H17-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511920/hotel-booking/room-types/demo-room-16.jpg', 0),
    (N'H18-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-17.jpg', 1),
    (N'H18-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-18.jpg', 0),
    (N'H18-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511951/hotel-booking/room-types/demo-room-19.jpg', 1),
    (N'H18-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-20.jpg', 0),
    (N'H18-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-21.jpg', 1),
    (N'H18-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511922/hotel-booking/room-types/demo-room-22.jpg', 0),
    (N'H19-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511922/hotel-booking/room-types/demo-room-23.jpg', 1),
    (N'H19-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511923/hotel-booking/room-types/demo-room-24.jpg', 0),
    (N'H19-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511923/hotel-booking/room-types/demo-room-25.jpg', 1),
    (N'H19-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511923/hotel-booking/room-types/demo-room-26.jpg', 0),
    (N'H19-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511924/hotel-booking/room-types/demo-room-27.jpg', 1),
    (N'H19-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511924/hotel-booking/room-types/demo-room-28.jpg', 0),
    (N'H20-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511925/hotel-booking/room-types/demo-room-29.jpg', 1),
    (N'H20-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511925/hotel-booking/room-types/demo-room-30.jpg', 0),
    (N'H20-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511925/hotel-booking/room-types/demo-room-31.jpg', 1),
    (N'H20-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511926/hotel-booking/room-types/demo-room-32.jpg', 0),
    (N'H21-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511926/hotel-booking/room-types/demo-room-33.jpg', 1),
    (N'H21-R1', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511926/hotel-booking/room-types/demo-room-34.jpg', 0),
    (N'H21-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511927/hotel-booking/room-types/demo-room-35.jpg', 1),
    (N'H21-R2', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511927/hotel-booking/room-types/demo-room-36.jpg', 0),
    (N'H21-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511927/hotel-booking/room-types/demo-room-37.jpg', 1),
    (N'H21-R3', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511928/hotel-booking/room-types/demo-room-38.jpg', 0)
) AS s (k, url, cover)
JOIN #room r ON r.k = s.k
WHERE NOT EXISTS (SELECT 1 FROM HINH_ANH_LOAI_PHONG i WHERE i.MaLoaiPhong = r.id AND i.URL = s.url);

INSERT INTO LOAI_PHONG_TIEN_NGHI (MaLoaiPhong, MaTienNghi)
SELECT r.id, t.MaTienNghi
FROM (VALUES
    (N'H01-R1', N'Wi-Fi miễn phí'),
    (N'H01-R1', N'Điều hòa nhiệt độ'),
    (N'H01-R1', N'TV màn hình phẳng'),
    (N'H01-R1', N'Máy sấy tóc'),
    (N'H01-R2', N'Wi-Fi miễn phí'),
    (N'H01-R2', N'Điều hòa nhiệt độ'),
    (N'H01-R2', N'TV màn hình phẳng'),
    (N'H01-R2', N'Minibar'),
    (N'H01-R2', N'Két sắt an toàn'),
    (N'H01-R2', N'Ban công'),
    (N'H01-R3', N'Wi-Fi miễn phí'),
    (N'H01-R3', N'Điều hòa nhiệt độ'),
    (N'H01-R3', N'TV màn hình phẳng'),
    (N'H01-R3', N'Minibar'),
    (N'H01-R3', N'Két sắt an toàn'),
    (N'H01-R3', N'Bồn tắm'),
    (N'H01-R3', N'Ban công'),
    (N'H02-R1', N'Wi-Fi miễn phí'),
    (N'H02-R1', N'Điều hòa nhiệt độ'),
    (N'H02-R1', N'TV màn hình phẳng'),
    (N'H02-R1', N'Máy sấy tóc'),
    (N'H02-R2', N'Wi-Fi miễn phí'),
    (N'H02-R2', N'Điều hòa nhiệt độ'),
    (N'H02-R2', N'TV màn hình phẳng'),
    (N'H02-R2', N'Két sắt an toàn'),
    (N'H02-R3', N'Wi-Fi miễn phí'),
    (N'H02-R3', N'Điều hòa nhiệt độ'),
    (N'H02-R3', N'TV màn hình phẳng'),
    (N'H02-R3', N'Minibar'),
    (N'H02-R3', N'Bồn tắm'),
    (N'H03-R1', N'Wi-Fi miễn phí'),
    (N'H03-R1', N'Điều hòa nhiệt độ'),
    (N'H03-R1', N'TV màn hình phẳng'),
    (N'H03-R1', N'Minibar'),
    (N'H03-R1', N'Két sắt an toàn'),
    (N'H03-R1', N'Ban công'),
    (N'H03-R2', N'Wi-Fi miễn phí'),
    (N'H03-R2', N'Điều hòa nhiệt độ'),
    (N'H03-R2', N'TV màn hình phẳng'),
    (N'H03-R2', N'Minibar'),
    (N'H03-R2', N'Két sắt an toàn'),
    (N'H03-R2', N'Bồn tắm'),
    (N'H03-R2', N'Ban công'),
    (N'H03-R3', N'Wi-Fi miễn phí'),
    (N'H03-R3', N'Điều hòa nhiệt độ'),
    (N'H03-R3', N'TV màn hình phẳng'),
    (N'H03-R3', N'Minibar'),
    (N'H03-R3', N'Két sắt an toàn'),
    (N'H03-R3', N'Bồn tắm'),
    (N'H03-R3', N'Ban công'),
    (N'H04-R1', N'Wi-Fi miễn phí'),
    (N'H04-R1', N'Điều hòa nhiệt độ'),
    (N'H04-R1', N'TV màn hình phẳng'),
    (N'H04-R1', N'Máy sấy tóc'),
    (N'H04-R2', N'Wi-Fi miễn phí'),
    (N'H04-R2', N'Điều hòa nhiệt độ'),
    (N'H04-R2', N'TV màn hình phẳng'),
    (N'H04-R2', N'Két sắt an toàn'),
    (N'H04-R3', N'Wi-Fi miễn phí'),
    (N'H04-R3', N'Điều hòa nhiệt độ'),
    (N'H04-R3', N'TV màn hình phẳng'),
    (N'H04-R3', N'Minibar'),
    (N'H04-R3', N'Két sắt an toàn'),
    (N'H04-R3', N'Ban công'),
    (N'H04-R4', N'Wi-Fi miễn phí'),
    (N'H04-R4', N'Điều hòa nhiệt độ'),
    (N'H04-R4', N'TV màn hình phẳng'),
    (N'H04-R4', N'Minibar'),
    (N'H04-R4', N'Bồn tắm'),
    (N'H05-R1', N'Wi-Fi miễn phí'),
    (N'H05-R1', N'Điều hòa nhiệt độ'),
    (N'H05-R1', N'TV màn hình phẳng'),
    (N'H05-R1', N'Minibar'),
    (N'H05-R1', N'Két sắt an toàn'),
    (N'H05-R1', N'Ban công'),
    (N'H05-R2', N'Wi-Fi miễn phí'),
    (N'H05-R2', N'Điều hòa nhiệt độ'),
    (N'H05-R2', N'TV màn hình phẳng'),
    (N'H05-R2', N'Minibar'),
    (N'H05-R2', N'Két sắt an toàn'),
    (N'H05-R2', N'Bồn tắm'),
    (N'H05-R2', N'Ban công'),
    (N'H05-R3', N'Wi-Fi miễn phí'),
    (N'H05-R3', N'Điều hòa nhiệt độ'),
    (N'H05-R3', N'TV màn hình phẳng'),
    (N'H05-R3', N'Minibar'),
    (N'H05-R3', N'Bồn tắm'),
    (N'H06-R1', N'Wi-Fi miễn phí'),
    (N'H06-R1', N'Điều hòa nhiệt độ'),
    (N'H06-R1', N'TV màn hình phẳng'),
    (N'H06-R1', N'Máy sấy tóc'),
    (N'H06-R2', N'Wi-Fi miễn phí'),
    (N'H06-R2', N'Điều hòa nhiệt độ'),
    (N'H06-R2', N'TV màn hình phẳng'),
    (N'H06-R2', N'Két sắt an toàn'),
    (N'H07-R1', N'Wi-Fi miễn phí'),
    (N'H07-R1', N'Điều hòa nhiệt độ'),
    (N'H07-R1', N'TV màn hình phẳng'),
    (N'H07-R1', N'Minibar'),
    (N'H07-R1', N'Két sắt an toàn'),
    (N'H07-R1', N'Ban công'),
    (N'H07-R2', N'Wi-Fi miễn phí'),
    (N'H07-R2', N'Điều hòa nhiệt độ'),
    (N'H07-R2', N'TV màn hình phẳng'),
    (N'H07-R2', N'Minibar'),
    (N'H07-R2', N'Bồn tắm'),
    (N'H07-R3', N'Wi-Fi miễn phí'),
    (N'H07-R3', N'Điều hòa nhiệt độ'),
    (N'H07-R3', N'TV màn hình phẳng'),
    (N'H07-R3', N'Minibar'),
    (N'H07-R3', N'Két sắt an toàn'),
    (N'H07-R3', N'Bồn tắm'),
    (N'H07-R3', N'Ban công'),
    (N'H07-R4', N'Wi-Fi miễn phí'),
    (N'H07-R4', N'Điều hòa nhiệt độ'),
    (N'H07-R4', N'TV màn hình phẳng'),
    (N'H07-R4', N'Minibar'),
    (N'H07-R4', N'Két sắt an toàn'),
    (N'H07-R4', N'Bồn tắm'),
    (N'H07-R4', N'Ban công'),
    (N'H08-R1', N'Wi-Fi miễn phí'),
    (N'H08-R1', N'Điều hòa nhiệt độ'),
    (N'H08-R1', N'TV màn hình phẳng'),
    (N'H08-R1', N'Máy sấy tóc'),
    (N'H08-R2', N'Wi-Fi miễn phí'),
    (N'H08-R2', N'Điều hòa nhiệt độ'),
    (N'H08-R2', N'TV màn hình phẳng'),
    (N'H08-R2', N'Minibar'),
    (N'H08-R2', N'Két sắt an toàn'),
    (N'H08-R2', N'Ban công'),
    (N'H08-R3', N'Wi-Fi miễn phí'),
    (N'H08-R3', N'Điều hòa nhiệt độ'),
    (N'H08-R3', N'TV màn hình phẳng'),
    (N'H08-R3', N'Két sắt an toàn'),
    (N'H09-R1', N'Wi-Fi miễn phí'),
    (N'H09-R1', N'Điều hòa nhiệt độ'),
    (N'H09-R1', N'TV màn hình phẳng'),
    (N'H09-R1', N'Minibar'),
    (N'H09-R1', N'Két sắt an toàn'),
    (N'H09-R1', N'Ban công'),
    (N'H09-R2', N'Wi-Fi miễn phí'),
    (N'H09-R2', N'Điều hòa nhiệt độ'),
    (N'H09-R2', N'TV màn hình phẳng'),
    (N'H09-R2', N'Minibar'),
    (N'H09-R2', N'Két sắt an toàn'),
    (N'H09-R2', N'Bồn tắm'),
    (N'H09-R2', N'Ban công'),
    (N'H10-R1', N'Wi-Fi miễn phí'),
    (N'H10-R1', N'Điều hòa nhiệt độ'),
    (N'H10-R1', N'TV màn hình phẳng'),
    (N'H10-R1', N'Máy sấy tóc'),
    (N'H10-R2', N'Wi-Fi miễn phí'),
    (N'H10-R2', N'Điều hòa nhiệt độ'),
    (N'H10-R2', N'TV màn hình phẳng'),
    (N'H10-R2', N'Minibar'),
    (N'H10-R2', N'Két sắt an toàn'),
    (N'H10-R2', N'Ban công'),
    (N'H10-R3', N'Wi-Fi miễn phí'),
    (N'H10-R3', N'Điều hòa nhiệt độ'),
    (N'H10-R3', N'TV màn hình phẳng'),
    (N'H10-R3', N'Minibar'),
    (N'H10-R3', N'Bồn tắm'),
    (N'H11-R1', N'Wi-Fi miễn phí'),
    (N'H11-R1', N'Điều hòa nhiệt độ'),
    (N'H11-R1', N'TV màn hình phẳng'),
    (N'H11-R1', N'Minibar'),
    (N'H11-R1', N'Két sắt an toàn'),
    (N'H11-R1', N'Ban công'),
    (N'H11-R2', N'Wi-Fi miễn phí'),
    (N'H11-R2', N'Điều hòa nhiệt độ'),
    (N'H11-R2', N'TV màn hình phẳng'),
    (N'H11-R2', N'Minibar'),
    (N'H11-R2', N'Két sắt an toàn'),
    (N'H11-R2', N'Bồn tắm'),
    (N'H11-R2', N'Ban công'),
    (N'H11-R3', N'Wi-Fi miễn phí'),
    (N'H11-R3', N'Điều hòa nhiệt độ'),
    (N'H11-R3', N'TV màn hình phẳng'),
    (N'H11-R3', N'Minibar'),
    (N'H11-R3', N'Két sắt an toàn'),
    (N'H11-R3', N'Bồn tắm'),
    (N'H11-R3', N'Ban công'),
    (N'H12-R1', N'Wi-Fi miễn phí'),
    (N'H12-R1', N'Điều hòa nhiệt độ'),
    (N'H12-R1', N'TV màn hình phẳng'),
    (N'H12-R1', N'Máy sấy tóc'),
    (N'H12-R2', N'Wi-Fi miễn phí'),
    (N'H12-R2', N'Điều hòa nhiệt độ'),
    (N'H12-R2', N'TV màn hình phẳng'),
    (N'H12-R2', N'Minibar'),
    (N'H12-R2', N'Bồn tắm'),
    (N'H13-R1', N'Wi-Fi miễn phí'),
    (N'H13-R1', N'Điều hòa nhiệt độ'),
    (N'H13-R1', N'TV màn hình phẳng'),
    (N'H13-R1', N'Máy sấy tóc'),
    (N'H13-R2', N'Wi-Fi miễn phí'),
    (N'H13-R2', N'Điều hòa nhiệt độ'),
    (N'H13-R2', N'TV màn hình phẳng'),
    (N'H13-R2', N'Minibar'),
    (N'H13-R2', N'Két sắt an toàn'),
    (N'H13-R2', N'Ban công'),
    (N'H13-R3', N'Wi-Fi miễn phí'),
    (N'H13-R3', N'Điều hòa nhiệt độ'),
    (N'H13-R3', N'TV màn hình phẳng'),
    (N'H13-R3', N'Minibar'),
    (N'H13-R3', N'Két sắt an toàn'),
    (N'H13-R3', N'Bồn tắm'),
    (N'H13-R3', N'Ban công'),
    (N'H14-R1', N'Wi-Fi miễn phí'),
    (N'H14-R1', N'Điều hòa nhiệt độ'),
    (N'H14-R1', N'TV màn hình phẳng'),
    (N'H14-R1', N'Máy sấy tóc'),
    (N'H14-R2', N'Wi-Fi miễn phí'),
    (N'H14-R2', N'Điều hòa nhiệt độ'),
    (N'H14-R2', N'TV màn hình phẳng'),
    (N'H14-R2', N'Minibar'),
    (N'H14-R2', N'Két sắt an toàn'),
    (N'H14-R2', N'Ban công'),
    (N'H14-R3', N'Wi-Fi miễn phí'),
    (N'H14-R3', N'Điều hòa nhiệt độ'),
    (N'H14-R3', N'TV màn hình phẳng'),
    (N'H14-R3', N'Minibar'),
    (N'H14-R3', N'Bồn tắm'),
    (N'H15-R1', N'Wi-Fi miễn phí'),
    (N'H15-R1', N'Điều hòa nhiệt độ'),
    (N'H15-R1', N'TV màn hình phẳng'),
    (N'H15-R1', N'Máy sấy tóc'),
    (N'H15-R2', N'Wi-Fi miễn phí'),
    (N'H15-R2', N'Điều hòa nhiệt độ'),
    (N'H15-R2', N'TV màn hình phẳng'),
    (N'H15-R2', N'Minibar'),
    (N'H15-R2', N'Bồn tắm'),
    (N'H16-R1', N'Wi-Fi miễn phí'),
    (N'H16-R1', N'Điều hòa nhiệt độ'),
    (N'H16-R1', N'TV màn hình phẳng'),
    (N'H16-R1', N'Minibar'),
    (N'H16-R1', N'Két sắt an toàn'),
    (N'H16-R1', N'Ban công'),
    (N'H16-R2', N'Wi-Fi miễn phí'),
    (N'H16-R2', N'Điều hòa nhiệt độ'),
    (N'H16-R2', N'TV màn hình phẳng'),
    (N'H16-R2', N'Minibar'),
    (N'H16-R2', N'Bồn tắm'),
    (N'H16-R3', N'Wi-Fi miễn phí'),
    (N'H16-R3', N'Điều hòa nhiệt độ'),
    (N'H16-R3', N'TV màn hình phẳng'),
    (N'H16-R3', N'Minibar'),
    (N'H16-R3', N'Két sắt an toàn'),
    (N'H16-R3', N'Bồn tắm'),
    (N'H16-R3', N'Ban công'),
    (N'H17-R1', N'Wi-Fi miễn phí'),
    (N'H17-R1', N'Điều hòa nhiệt độ'),
    (N'H17-R1', N'TV màn hình phẳng'),
    (N'H17-R1', N'Máy sấy tóc'),
    (N'H17-R2', N'Wi-Fi miễn phí'),
    (N'H17-R2', N'Điều hòa nhiệt độ'),
    (N'H17-R2', N'TV màn hình phẳng'),
    (N'H17-R2', N'Két sắt an toàn'),
    (N'H18-R1', N'Wi-Fi miễn phí'),
    (N'H18-R1', N'Điều hòa nhiệt độ'),
    (N'H18-R1', N'TV màn hình phẳng'),
    (N'H18-R1', N'Máy sấy tóc'),
    (N'H18-R2', N'Wi-Fi miễn phí'),
    (N'H18-R2', N'Điều hòa nhiệt độ'),
    (N'H18-R2', N'TV màn hình phẳng'),
    (N'H18-R2', N'Minibar'),
    (N'H18-R2', N'Két sắt an toàn'),
    (N'H18-R2', N'Ban công'),
    (N'H18-R3', N'Wi-Fi miễn phí'),
    (N'H18-R3', N'Điều hòa nhiệt độ'),
    (N'H18-R3', N'TV màn hình phẳng'),
    (N'H18-R3', N'Minibar'),
    (N'H18-R3', N'Bồn tắm'),
    (N'H19-R1', N'Wi-Fi miễn phí'),
    (N'H19-R1', N'Điều hòa nhiệt độ'),
    (N'H19-R1', N'TV màn hình phẳng'),
    (N'H19-R1', N'Máy sấy tóc'),
    (N'H19-R2', N'Wi-Fi miễn phí'),
    (N'H19-R2', N'Điều hòa nhiệt độ'),
    (N'H19-R2', N'TV màn hình phẳng'),
    (N'H19-R2', N'Minibar'),
    (N'H19-R2', N'Két sắt an toàn'),
    (N'H19-R2', N'Ban công'),
    (N'H19-R3', N'Wi-Fi miễn phí'),
    (N'H19-R3', N'Điều hòa nhiệt độ'),
    (N'H19-R3', N'TV màn hình phẳng'),
    (N'H19-R3', N'Minibar'),
    (N'H19-R3', N'Bồn tắm'),
    (N'H20-R1', N'Wi-Fi miễn phí'),
    (N'H20-R1', N'Điều hòa nhiệt độ'),
    (N'H20-R1', N'TV màn hình phẳng'),
    (N'H20-R1', N'Máy sấy tóc'),
    (N'H20-R2', N'Wi-Fi miễn phí'),
    (N'H20-R2', N'Điều hòa nhiệt độ'),
    (N'H20-R2', N'TV màn hình phẳng'),
    (N'H20-R2', N'Minibar'),
    (N'H20-R2', N'Két sắt an toàn'),
    (N'H20-R2', N'Ban công'),
    (N'H21-R1', N'Wi-Fi miễn phí'),
    (N'H21-R1', N'Điều hòa nhiệt độ'),
    (N'H21-R1', N'TV màn hình phẳng'),
    (N'H21-R1', N'Máy sấy tóc'),
    (N'H21-R2', N'Wi-Fi miễn phí'),
    (N'H21-R2', N'Điều hòa nhiệt độ'),
    (N'H21-R2', N'TV màn hình phẳng'),
    (N'H21-R2', N'Két sắt an toàn'),
    (N'H21-R3', N'Wi-Fi miễn phí'),
    (N'H21-R3', N'Điều hòa nhiệt độ'),
    (N'H21-R3', N'TV màn hình phẳng'),
    (N'H21-R3', N'Minibar'),
    (N'H21-R3', N'Bồn tắm')
) AS s (k, amenity)
JOIN #room r ON r.k = s.k
JOIN TIEN_NGHI t ON t.TenTienNghi = s.amenity
WHERE NOT EXISTS (SELECT 1 FROM LOAI_PHONG_TIEN_NGHI x WHERE x.MaLoaiPhong = r.id AND x.MaTienNghi = t.MaTienNghi);

/* ---------------------------------------------------------- rate calendar (QUY_PHONG_GIA), day -120 .. 149
   Fri/Sat nights +20%, rounded to 10.000đ. One maintenance window is "Đóng bán". */
;WITH days AS (
    SELECT TOP (270) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) + (-121) AS d
    FROM sys.all_objects a CROSS JOIN sys.all_objects b
)
INSERT INTO QUY_PHONG_GIA (MaLoaiPhong, NgayApDung, GiaPhong, SoLuongPhong, TrangThai)
SELECT r.id, DATEADD(DAY, days.d, @today),
       ROUND(r.price * CASE WHEN DATEPART(WEEKDAY, DATEADD(DAY, days.d, @today)) IN (5, 6) THEN 1.2 ELSE 1 END, -4),
       r.inv,
       CASE WHEN r.k = 'H05-R1' AND days.d BETWEEN 40 AND 44 THEN N'Đóng bán' ELSE N'Mở bán' END
FROM #room r CROSS JOIN days
WHERE NOT EXISTS (SELECT 1 FROM QUY_PHONG_GIA x WHERE x.MaLoaiPhong = r.id AND x.NgayApDung = DATEADD(DAY, days.d, @today));

/* ---------------------------------------------------------- promotions (UC15 / UC39 / UC40) */
INSERT INTO KHUYEN_MAI (MaCode, LoaiGiamGia, GiaTriGiam, GiaTriDonToiThieu, MucGiamToiDa, SoLuongGioiHan, NgayBatDau, NgayKetThuc, PhamViApDung, TrangThai)
SELECT s.code, s.kind, s.val, s.minOrder, s.cap, s.lim, DATEADD(DAY, s.fromD, @today), DATEADD(DAY, s.toD, @today), N'Toàn hệ thống', s.st
FROM (VALUES
    ('CHAOMUNG10', N'Phần trăm', 10, 0, 500000, 0, -160, 180, N'Hoạt động'),
    ('GIAM200K', N'Số tiền cố định', 200000, 1500000, 0, 200, -60, 120, N'Hoạt động'),
    ('CUOITUAN15', N'Phần trăm', 15, 2000000, 800000, 100, -30, 90, N'Hoạt động'),
    ('VIP25', N'Phần trăm', 25, 5000000, 2000000, 30, -45, 150, N'Hoạt động'),
    ('HETLUOT', N'Số tiền cố định', 100000, 0, 0, 3, -160, 100, N'Hoạt động'),
    ('HETHAN20', N'Phần trăm', 20, 0, 1000000, 0, -120, -10, N'Hoạt động'),
    ('SAPTOI30', N'Phần trăm', 30, 1000000, 1500000, 50, 10, 60, N'Hoạt động'),
    ('TAMNGUNG', N'Phần trăm', 12, 0, 600000, 0, -30, 60, N'Ngừng')
) AS s (code, kind, val, minOrder, cap, lim, fromD, toD, st)
WHERE NOT EXISTS (SELECT 1 FROM KHUYEN_MAI k WHERE k.MaCode = s.code);

/* ---------------------------------------------------------- bookings
   Totals follow bookings.service.ts: room total = qty × Σ nightly GiaPhong;
   discount per evaluatePromotion (percent capped by MucGiamToiDa when > 0, fixed capped
   at the total, only if total ≥ GiaTriDonToiThieu); payable = total − discount. */
CREATE TABLE #bk (code VARCHAR(20) PRIMARY KEY, cust NVARCHAR(100), rk VARCHAR(12), qty INT, ci INT, nights INT, scenario VARCHAR(20),
                  promo VARCHAR(50) NULL, createdDay INT, createdMin INT, cancelHours INT NULL, note NVARCHAR(MAX) NULL, cancelReason NVARCHAR(500) NULL, refundFails BIT,
                  created DATETIME2 NULL, total DECIMAL(14,2) NULL, discount DECIMAL(14,2) NULL, promoId INT NULL, id INT NULL);
INSERT INTO #bk (code, cust, rk, qty, ci, nights, scenario, promo, createdDay, createdMin, cancelHours, note, cancelReason, refundFails) VALUES
    ('DEMO-0001', N'demo_kh_an', N'H07-R3', 1, 20, 3, 'future', NULL, -6, 944, NULL, N'Tuần trăng mật, cần phòng tầng cao.', NULL, 0),
    ('DEMO-0002', N'demo_kh_giang', N'H07-R3', 1, 21, 2, 'future', NULL, -4, 706, NULL, NULL, NULL, 0),
    ('DEMO-0003', N'demo_kh_binh', N'H08-R2', 1, -24, 2, 'completed', 'HETLUOT', -46, 1277, NULL, NULL, NULL, 0),
    ('DEMO-0004', N'demo_kh_hai', N'H03-R1', 1, -29, 2, 'completed', 'HETLUOT', -34, 1124, NULL, N'Cho mình xin phòng tầng cao, yên tĩnh.', NULL, 0),
    ('DEMO-0005', N'demo_kh_mai', N'H14-R1', 2, -33, 2, 'completed', 'HETLUOT', -56, 738, NULL, N'Nhận phòng muộn khoảng 22h.', NULL, 0),
    ('DEMO-0006', N'demo_kh_cuong', N'H17-R1', 1, -42, 2, 'completed', NULL, -68, 1111, NULL, N'Nhận phòng muộn khoảng 22h.', NULL, 0),
    ('DEMO-0007', N'demo_kh_huong', N'H17-R2', 1, -94, 2, 'completed', NULL, -121, 525, NULL, N'Nhận phòng muộn khoảng 22h.', NULL, 0),
    ('DEMO-0008', N'demo_kh_long', N'H20-R1', 1, -48, 2, 'completed', NULL, -72, 880, NULL, NULL, NULL, 0),
    ('DEMO-0009', N'demo_kh_hai', N'H20-R2', 1, -84, 2, 'completed', NULL, -98, 731, NULL, N'Cho mình xin phòng tầng cao, yên tĩnh.', NULL, 0),
    ('DEMO-0010', N'demo_kh_hieu', N'H14-R1', 1, -102, 1, 'completed', 'CUOITUAN15', -121, 1105, NULL, N'Nhận phòng muộn khoảng 22h.', NULL, 0),
    ('DEMO-0011', N'demo_kh_khanh', N'H13-R1', 1, -78, 3, 'completed', NULL, -99, 1250, NULL, NULL, NULL, 0),
    ('DEMO-0012', N'demo_kh_mai', N'H03-R2', 1, -21, 1, 'completed', 'GIAM200K', -31, 1297, NULL, NULL, NULL, 0),
    ('DEMO-0013', N'demo_kh_hai', N'H02-R2', 1, -70, 3, 'completed', NULL, -96, 1048, NULL, NULL, NULL, 0),
    ('DEMO-0014', N'demo_kh_dung', N'H06-R2', 1, -84, 1, 'completed', NULL, -101, 915, NULL, NULL, NULL, 0),
    ('DEMO-0015', N'demo_kh_nam', N'H08-R3', 1, -78, 1, 'completed', NULL, -82, 1224, NULL, NULL, NULL, 0),
    ('DEMO-0016', N'demo_kh_long', N'H07-R4', 1, -98, 3, 'completed', NULL, -122, 1039, NULL, NULL, NULL, 0),
    ('DEMO-0017', N'demo_kh_giang', N'H02-R1', 1, -105, 3, 'completed', 'CHAOMUNG10', -119, 451, NULL, NULL, NULL, 0),
    ('DEMO-0018', N'demo_kh_binh', N'H15-R1', 1, -34, 1, 'completed', NULL, -62, 1067, NULL, NULL, NULL, 0),
    ('DEMO-0019', N'demo_kh_huong', N'H21-R2', 1, -17, 3, 'completed', NULL, -33, 1047, NULL, N'Nhận phòng muộn khoảng 22h.', NULL, 0),
    ('DEMO-0020', N'demo_kh_binh', N'H19-R2', 2, -20, 3, 'completed', NULL, -50, 765, NULL, NULL, NULL, 0),
    ('DEMO-0021', N'demo_kh_dung', N'H06-R2', 1, -27, 3, 'completed', 'CUOITUAN15', -35, 929, NULL, N'Cho mình xin phòng tầng cao, yên tĩnh.', NULL, 0),
    ('DEMO-0022', N'demo_kh_khanh', N'H05-R1', 1, -77, 3, 'completed', NULL, -107, 1121, NULL, NULL, NULL, 0),
    ('DEMO-0023', N'demo_kh_khanh', N'H12-R2', 1, -67, 2, 'completed', NULL, -71, 500, NULL, NULL, NULL, 0),
    ('DEMO-0024', N'demo_kh_an', N'H21-R2', 1, -110, 2, 'completed', NULL, -130, 915, NULL, NULL, NULL, 0),
    ('DEMO-0025', N'demo_kh_quynh', N'H18-R1', 1, -41, 4, 'completed', NULL, -46, 1271, NULL, NULL, NULL, 0),
    ('DEMO-0026', N'demo_kh_linh', N'H14-R2', 1, -10, 3, 'completed', NULL, -13, 565, NULL, NULL, NULL, 0),
    ('DEMO-0027', N'demo_kh_quynh', N'H02-R2', 2, -27, 4, 'completed', NULL, -55, 643, NULL, NULL, NULL, 0),
    ('DEMO-0028', N'demo_kh_hanh', N'H15-R2', 1, -65, 4, 'completed', NULL, -86, 577, NULL, N'Cho mình xin phòng tầng cao, yên tĩnh.', NULL, 0),
    ('DEMO-0029', N'demo_kh_ngoc', N'H14-R2', 2, -18, 3, 'completed', NULL, -38, 1300, NULL, N'Đi chuyến bay đến lúc 6h sáng, xin nhận phòng sớm nếu được.', NULL, 0),
    ('DEMO-0030', N'demo_kh_giang', N'H14-R1', 2, -14, 4, 'completed', NULL, -21, 796, NULL, NULL, NULL, 0),
    ('DEMO-0031', N'demo_kh_giang', N'H16-R2', 1, -38, 3, 'completed', NULL, -64, 1315, NULL, NULL, NULL, 0),
    ('DEMO-0032', N'demo_kh_quynh', N'H18-R3', 1, -82, 2, 'completed', 'CUOITUAN15', -104, 430, NULL, NULL, NULL, 0),
    ('DEMO-0033', N'demo_kh_linh', N'H18-R2', 1, -85, 4, 'completed', 'CHAOMUNG10', -114, 535, NULL, NULL, NULL, 0),
    ('DEMO-0034', N'demo_kh_huong', N'H05-R1', 2, -19, 2, 'completed', NULL, -23, 563, NULL, N'Cho mình xin phòng tầng cao, yên tĩnh.', NULL, 0),
    ('DEMO-0035', N'demo_kh_trang', N'H21-R1', 1, -83, 4, 'completed', NULL, -90, 1071, NULL, NULL, NULL, 0),
    ('DEMO-0036', N'demo_kh_hanh', N'H16-R2', 1, -38, 3, 'completed', NULL, -51, 1153, NULL, NULL, NULL, 0),
    ('DEMO-0037', N'demo_kh_tuan', N'H03-R3', 1, -65, 1, 'completed', NULL, -84, 733, NULL, NULL, NULL, 0),
    ('DEMO-0038', N'demo_kh_an', N'H11-R2', 1, -13, 4, 'completed', NULL, -21, 1230, NULL, NULL, NULL, 0),
    ('DEMO-0039', N'demo_kh_cuong', N'H05-R3', 1, -27, 2, 'completed', 'CUOITUAN15', -40, 1010, NULL, N'Không hút thuốc, dị ứng lông vũ.', NULL, 0),
    ('DEMO-0040', N'demo_kh_tuan', N'H01-R2', 2, -103, 3, 'completed', NULL, -128, 1138, NULL, NULL, NULL, 0),
    ('DEMO-0041', N'demo_kh_ngoc', N'H16-R2', 1, -1, 4, 'current', NULL, -16, 519, NULL, N'Đi chuyến bay đến lúc 6h sáng, xin nhận phòng sớm nếu được.', NULL, 0),
    ('DEMO-0042', N'demo_kh_quynh', N'H12-R2', 1, -1, 3, 'current', NULL, -17, 691, NULL, NULL, NULL, 0),
    ('DEMO-0043', N'demo_kh_quynh', N'H08-R3', 1, 0, 3, 'current', NULL, -23, 1030, NULL, NULL, NULL, 0),
    ('DEMO-0044', N'demo_kh_tuan', N'H13-R2', 1, 87, 5, 'future', NULL, -4, 971, NULL, NULL, NULL, 0),
    ('DEMO-0045', N'demo_kh_nam', N'H11-R3', 1, 22, 1, 'future', NULL, -9, 845, NULL, NULL, NULL, 0),
    ('DEMO-0046', N'demo_kh_quynh', N'H18-R2', 2, 11, 3, 'future', 'CHAOMUNG10', -16, 868, NULL, N'Đi chuyến bay đến lúc 6h sáng, xin nhận phòng sớm nếu được.', NULL, 0),
    ('DEMO-0047', N'demo_kh_dung', N'H19-R3', 1, 46, 1, 'future', NULL, -9, 1168, NULL, NULL, NULL, 0),
    ('DEMO-0048', N'demo_kh_ngoc', N'H19-R1', 1, 94, 5, 'future', NULL, -12, 746, NULL, NULL, NULL, 0),
    ('DEMO-0049', N'demo_kh_mai', N'H16-R2', 1, 6, 1, 'future', NULL, -22, 807, NULL, NULL, NULL, 0),
    ('DEMO-0050', N'demo_kh_ngoc', N'H14-R2', 1, 16, 1, 'future', NULL, -17, 563, NULL, NULL, NULL, 0),
    ('DEMO-0051', N'demo_kh_cuong', N'H14-R3', 2, 49, 5, 'future', NULL, -28, 674, NULL, NULL, NULL, 0),
    ('DEMO-0052', N'demo_kh_ngoc', N'H14-R1', 1, 30, 5, 'future', NULL, -12, 422, NULL, NULL, NULL, 0),
    ('DEMO-0053', N'demo_kh_linh', N'H05-R3', 1, 50, 1, 'future', NULL, -13, 957, NULL, NULL, NULL, 0),
    ('DEMO-0054', N'demo_kh_trang', N'H01-R3', 1, 42, 5, 'future', NULL, -17, 582, NULL, NULL, NULL, 0),
    ('DEMO-0055', N'demo_kh_quynh', N'H08-R3', 1, 5, 4, 'future', NULL, -7, 523, NULL, NULL, NULL, 0),
    ('DEMO-0056', N'demo_kh_giang', N'H19-R2', 1, 107, 1, 'future', 'CHAOMUNG10', -20, 658, NULL, NULL, NULL, 0),
    ('DEMO-0057', N'demo_kh_hai', N'H05-R2', 1, 83, 4, 'future', NULL, -29, 841, NULL, N'Kỷ niệm ngày cưới, mong khách sạn trang trí giúp.', NULL, 0),
    ('DEMO-0058', N'demo_kh_binh', N'H05-R1', 1, 69, 4, 'future', NULL, -17, 906, NULL, NULL, NULL, 0),
    ('DEMO-0059', N'demo_kh_long', N'H05-R2', 1, 39, 2, 'future', NULL, -6, 1069, NULL, NULL, NULL, 0),
    ('DEMO-0060', N'demo_kh_khanh', N'H10-R1', 2, 95, 3, 'future', 'CHAOMUNG10', -30, 1079, NULL, NULL, NULL, 0),
    ('DEMO-0061', N'demo_kh_quynh', N'H11-R2', 1, 37, 1, 'future', NULL, -19, 634, NULL, NULL, NULL, 0),
    ('DEMO-0062', N'demo_kh_linh', N'H13-R1', 2, 78, 5, 'future', NULL, -17, 570, NULL, NULL, NULL, 0),
    ('DEMO-0063', N'demo_kh_son', N'H19-R1', 1, 69, 3, 'future', NULL, -14, 474, NULL, NULL, NULL, 0),
    ('DEMO-0064', N'demo_kh_dung', N'H08-R1', 1, 45, 3, 'cancel_refund', NULL, -11, 1156, 1200, NULL, N'Đặt nhầm ngày', 0),
    ('DEMO-0065', N'demo_kh_long', N'H08-R1', 2, 30, 2, 'cancel_refund', NULL, -17, 722, 840, NULL, N'Tìm được lựa chọn phù hợp hơn', 0),
    ('DEMO-0066', N'demo_kh_quynh', N'H11-R1', 1, -15, 2, 'cancel_refund', NULL, -29, 991, 144, NULL, N'Tìm được lựa chọn phù hợp hơn', 0),
    ('DEMO-0067', N'demo_kh_phong', N'H06-R1', 2, -40, 3, 'cancel_refund', NULL, -55, 1180, 72, NULL, N'Gia đình có việc đột xuất', 1),
    ('DEMO-0068', N'demo_kh_binh', N'H21-R2', 2, -25, 2, 'cancel_refund', NULL, -38, 758, 30, NULL, N'Thay đổi lịch công tác', 0),
    ('DEMO-0069', N'demo_kh_an', N'H04-R3', 1, -8, 1, 'cancel_refund', NULL, -12, 908, 36, N'Cần thêm một giường phụ cho bé.', N'Tìm được lựa chọn phù hợp hơn', 0),
    ('DEMO-0070', N'demo_kh_dung', N'H16-R1', 2, -50, 2, 'cancel_refund', NULL, -58, 708, 10, N'Đi chuyến bay đến lúc 6h sáng, xin nhận phòng sớm nếu được.', N'Chuyến bay bị hủy', 0),
    ('DEMO-0071', N'demo_kh_huong', N'H06-R2', 1, 27, 3, 'cancel_unpaid', NULL, -1, 874, NULL, NULL, N'Gia đình có việc đột xuất', 0),
    ('DEMO-0072', N'demo_kh_khanh', N'H18-R1', 1, 11, 2, 'cancel_unpaid', NULL, -1, 1120, NULL, NULL, N'Đặt nhầm ngày', 0),
    ('DEMO-0073', N'demo_kh_hanh', N'H02-R2', 1, -35, 1, 'cancel_unpaid', NULL, -43, 790, NULL, N'Cần thêm một giường phụ cho bé.', NULL, 0),
    ('DEMO-0074', N'demo_kh_phong', N'H02-R3', 1, -55, 1, 'cancel_unpaid', NULL, -74, 939, NULL, NULL, N'Tìm được lựa chọn phù hợp hơn', 0),
    ('DEMO-0075', N'demo_kh_huong', N'H06-R2', 1, 58, 3, 'expired', NULL, -1, 1180, NULL, NULL, NULL, 0),
    ('DEMO-0076', N'demo_kh_cuong', N'H04-R2', 1, -9, 2, 'expired', NULL, -18, 865, NULL, NULL, NULL, 0),
    ('DEMO-0077', N'demo_kh_hieu', N'H11-R1', 2, 27, 2, 'expired_failed', NULL, -3, 700, NULL, N'Không hút thuốc, dị ứng lông vũ.', NULL, 0),
    ('DEMO-0078', N'demo_kh_an', N'H03-R3', 1, 14, 2, 'pending', NULL, 0, 1063, NULL, NULL, NULL, 0),
    ('DEMO-0079', N'demo_kh_trang', N'H06-R1', 1, 30, 3, 'pending', NULL, 0, 546, NULL, NULL, NULL, 0);

UPDATE b SET created = CASE WHEN b.scenario = 'pending' THEN @now
                            ELSE DATEADD(MINUTE, b.createdMin, CAST(DATEADD(DAY, b.createdDay, @today) AS DATETIME2)) END
FROM #bk b;
-- A cancellation must happen after the booking (and its payment) was created.
UPDATE b SET created = DATEADD(DAY, -2, DATEADD(HOUR, -b.cancelHours, CAST(DATEADD(DAY, b.ci, @today) AS DATETIME2)))
FROM #bk b
WHERE b.scenario = 'cancel_refund' AND b.created > DATEADD(HOUR, -b.cancelHours - 24, CAST(DATEADD(DAY, b.ci, @today) AS DATETIME2));

UPDATE b SET total = CASE WHEN x.c = b.nights THEN b.qty * x.s END
FROM #bk b JOIN #room r ON r.k = b.rk
CROSS APPLY (SELECT SUM(q.GiaPhong) AS s, COUNT(*) AS c FROM QUY_PHONG_GIA q
             WHERE q.MaLoaiPhong = r.id AND q.NgayApDung >= DATEADD(DAY, b.ci, @today) AND q.NgayApDung < DATEADD(DAY, b.ci + b.nights, @today)) x;

-- Same validity rules as evaluatePromotion(), judged on the day the booking was made.
UPDATE b SET promoId = k.MaKhuyenMai,
             discount = CASE WHEN k.LoaiGiamGia = N'Phần trăm'
                             THEN CASE WHEN k.MucGiamToiDa > 0 AND ROUND(b.total * k.GiaTriGiam / 100, 0) > k.MucGiamToiDa THEN k.MucGiamToiDa
                                       ELSE ROUND(b.total * k.GiaTriGiam / 100, 0) END
                             ELSE CASE WHEN k.GiaTriGiam > b.total THEN b.total ELSE k.GiaTriGiam END END
FROM #bk b JOIN KHUYEN_MAI k ON k.MaCode = b.promo
WHERE b.total >= k.GiaTriDonToiThieu
  AND k.TrangThai = N'Hoạt động'
  AND CAST(b.created AS DATE) BETWEEN k.NgayBatDau AND k.NgayKetThuc;
UPDATE #bk SET discount = 0 WHERE discount IS NULL;

IF EXISTS (SELECT 1 FROM #bk WHERE total IS NULL OR total <= 0)
    THROW 50001, 'Demo booking outside the generated rate calendar', 1;

INSERT INTO DAT_PHONG (MaXacNhanDatPhong, MaTaiKhoanKhachHang, MaKhachSan, MaKhuyenMai, MaChinhSachHuy, NgayNhanPhong, NgayTraPhong,
                       TongTienPhong, SoTienGiam, TongTienThanhToan, GhiChu, TrangThai, NgayTao, NgayCapNhat)
SELECT b.code, c.MaTaiKhoan, h.id, b.promoId, @policy,
       DATEADD(DAY, b.ci, @today), DATEADD(DAY, b.ci + b.nights, @today),
       b.total, b.discount, b.total - b.discount,
       CASE b.scenario
            WHEN 'cancel_refund' THEN CONCAT(b.note + N' | ', N'Khách hủy đặt phòng', N': ' + b.cancelReason)
            WHEN 'cancel_unpaid' THEN CONCAT(b.note + N' | ', N'Khách hủy đặt phòng', N': ' + b.cancelReason)
            WHEN 'expired' THEN CONCAT(b.note + N' | ', N'Tự động hủy do quá hạn thanh toán')
            WHEN 'expired_failed' THEN CONCAT(b.note + N' | ', N'Tự động hủy do quá hạn thanh toán')
            ELSE b.note END,
       CASE b.scenario WHEN 'completed' THEN N'Hoàn tất' WHEN 'current' THEN N'Đã xác nhận' WHEN 'future' THEN N'Đã xác nhận'
                       WHEN 'pending' THEN N'Chờ thanh toán' ELSE N'Đã hủy' END,
       b.created,
       CASE b.scenario
            WHEN 'completed' THEN CAST(DATEADD(DAY, b.ci + b.nights, @today) AS DATETIME2)
            WHEN 'cancel_refund' THEN DATEADD(HOUR, -b.cancelHours, CAST(DATEADD(DAY, b.ci, @today) AS DATETIME2))
            WHEN 'cancel_unpaid' THEN DATEADD(HOUR, 3, b.created)
            WHEN 'expired' THEN DATEADD(MINUTE, 16, b.created)
            WHEN 'expired_failed' THEN DATEADD(MINUTE, 16, b.created)
            WHEN 'pending' THEN b.created
            ELSE DATEADD(MINUTE, 8, b.created) END
FROM #bk b
JOIN TAI_KHOAN c ON c.TenDangNhap = b.cust
JOIN #room r ON r.k = b.rk
JOIN #hotel h ON h.k = r.hk
WHERE NOT EXISTS (SELECT 1 FROM DAT_PHONG d WHERE d.MaXacNhanDatPhong = b.code);

UPDATE b SET id = d.MaDatPhong FROM #bk b JOIN DAT_PHONG d ON d.MaXacNhanDatPhong = b.code;

INSERT INTO CHI_TIET_DAT_PHONG (MaDatPhong, MaLoaiPhong, SoLuongPhong)
SELECT b.id, r.id, b.qty
FROM #bk b JOIN #room r ON r.k = b.rk
WHERE NOT EXISTS (SELECT 1 FROM CHI_TIET_DAT_PHONG x WHERE x.MaDatPhong = b.id);

/* ---------------------------------------------------------- payments (VNPAY, same reference format as vnpay.ts) */
-- A failed first attempt before the successful one on some bookings, and on the expired one.
INSERT INTO THANH_TOAN (MaDatPhong, SoTien, PhuongThucThanhToan, MaGiaoDichDoiTac, TrangThai, ThoiGianGiaoDich)
SELECT b.id, b.total - b.discount, N'VNPAY', CONCAT('PAYDEMOF', REPLACE(b.code, '-', '')), N'Thất bại', DATEADD(MINUTE, 2, b.created)
FROM #bk b
WHERE (b.scenario = 'expired_failed' OR (b.scenario IN ('completed', 'future') AND b.id % 9 = 0))
  AND NOT EXISTS (SELECT 1 FROM THANH_TOAN t WHERE t.MaDatPhong = b.id AND t.TrangThai = N'Thất bại');

INSERT INTO THANH_TOAN (MaDatPhong, SoTien, PhuongThucThanhToan, MaGiaoDichDoiTac, TrangThai, ThoiGianGiaoDich)
SELECT b.id, b.total - b.discount, N'VNPAY',
       CONCAT('PAYDEMO', REPLACE(b.code, '-', ''), ':', 14000000 + b.id, ':', FORMAT(DATEADD(HOUR, 7, DATEADD(MINUTE, 6, b.created)), 'yyyyMMddHHmmss')),
       N'Thành công', DATEADD(MINUTE, 6, b.created)
FROM #bk b
WHERE b.scenario IN ('completed', 'current', 'future', 'cancel_refund')
  AND NOT EXISTS (SELECT 1 FROM THANH_TOAN t WHERE t.MaDatPhong = b.id AND t.TrangThai = N'Thành công');

/* ---------------------------------------------------------- refunds (tier = best CHI_TIET_CHINH_SACH_HUY row for the hours left) */
INSERT INTO HOAN_TIEN (MaThanhToan, SoTienHoan, LyDoHoanTien, MaGiaoDichDoiTac, TrangThai, NgayYeuCau, NgayHoanTien)
SELECT t.MaThanhToan,
       ROUND(t.SoTien * tier.TyLeHoanTien / 100, 0),
       CONCAT(N'Hủy đặt phòng — hoàn ', CAST(CAST(tier.TyLeHoanTien AS INT) AS NVARCHAR(3)), N'% theo chính sách hủy (', b.cancelHours, N'.0h trước nhận phòng)'),
       CONCAT('RFDEMO', REPLACE(b.code, '-', '')),
       CASE WHEN b.refundFails = 1 THEN N'Thất bại' ELSE N'Thành công' END,
       DATEADD(HOUR, -b.cancelHours, CAST(DATEADD(DAY, b.ci, @today) AS DATETIME2)),
       CASE WHEN b.refundFails = 1 THEN NULL ELSE DATEADD(MINUTE, 1, DATEADD(HOUR, -b.cancelHours, CAST(DATEADD(DAY, b.ci, @today) AS DATETIME2))) END
FROM #bk b
JOIN THANH_TOAN t ON t.MaDatPhong = b.id AND t.TrangThai = N'Thành công'
CROSS APPLY (SELECT TOP 1 c.TyLeHoanTien FROM CHI_TIET_CHINH_SACH_HUY c
             WHERE c.MaChinhSachHuy = @policy AND c.SoGioTruocNhanPhong <= b.cancelHours
             ORDER BY c.SoGioTruocNhanPhong DESC) tier
WHERE b.scenario = 'cancel_refund'
  AND ROUND(t.SoTien * tier.TyLeHoanTien / 100, 0) > 0
  AND NOT EXISTS (SELECT 1 FROM HOAN_TIEN x WHERE x.MaThanhToan = t.MaThanhToan);

/* ---------------------------------------------------------- reviews (only on "Hoàn tất" stays, one per booking) */
INSERT INTO DANH_GIA (MaDatPhong, MaKhachHang, MaKhachSan, DiemDanhGia, NoiDung, TrangThai)
SELECT d.MaDatPhong, d.MaTaiKhoanKhachHang, d.MaKhachSan, s.score, s.txt, s.st
FROM (VALUES
    ('DEMO-0003', 5, N'Kỳ nghỉ tuyệt vời, bữa sáng phong phú và hồ bơi rất đẹp.', N'Hiển thị'),
    ('DEMO-0004', 4, N'Khách sạn tốt so với giá tiền, chỉ có thang máy hơi chậm giờ cao điểm.', N'Hiển thị'),
    ('DEMO-0005', 4, N'Nhân viên thân thiện, bữa sáng ổn nhưng chưa đa dạng lắm.', N'Chờ duyệt'),
    ('DEMO-0007', 4, N'Nhân viên thân thiện, bữa sáng ổn nhưng chưa đa dạng lắm.', N'Hiển thị'),
    ('DEMO-0008', 1, N'Rất thất vọng: đặt phòng hướng biển nhưng được xếp phòng hướng bãi đỗ xe, lễ tân không hỗ trợ.', N'Hiển thị'),
    ('DEMO-0009', 4, N'Khách sạn tốt so với giá tiền, chỉ có thang máy hơi chậm giờ cao điểm.', N'Hiển thị'),
    ('DEMO-0011', 5, N'Liên hệ Zalo 0909xxxxxx để đặt phòng giá rẻ hơn 50%!!! Không cần qua web.', N'Vi phạm'),
    ('DEMO-0012', 5, N'Phòng sạch sẽ, view đẹp, nhân viên rất nhiệt tình. Chắc chắn sẽ quay lại!', N'Chờ duyệt'),
    ('DEMO-0013', 3, N'Tạm ổn, phòng hơi cũ so với hình trên web nhưng sạch sẽ.', N'Hiển thị'),
    ('DEMO-0015', 4, N'Nhân viên thân thiện, bữa sáng ổn nhưng chưa đa dạng lắm.', N'Hiển thị'),
    ('DEMO-0016', 5, N'Kỳ nghỉ tuyệt vời, bữa sáng phong phú và hồ bơi rất đẹp.', N'Hiển thị'),
    ('DEMO-0017', 4, N'Phòng đẹp, giường êm. Wi-Fi đôi lúc chập chờn.', N'Ẩn'),
    ('DEMO-0019', 4, N'Phòng đẹp, giường êm. Wi-Fi đôi lúc chập chờn.', N'Chờ duyệt'),
    ('DEMO-0020', 4, N'Liên hệ Zalo 0909xxxxxx để đặt phòng giá rẻ hơn 50%!!! Không cần qua web.', N'Vi phạm'),
    ('DEMO-0021', 3, N'Vị trí đẹp nhưng cách âm kém, buổi tối hơi ồn.', N'Hiển thị'),
    ('DEMO-0023', 3, NULL, N'Hiển thị'),
    ('DEMO-0024', 4, N'Khách sạn tốt so với giá tiền, chỉ có thang máy hơi chậm giờ cao điểm.', N'Hiển thị'),
    ('DEMO-0025', 4, N'Nhân viên thân thiện, bữa sáng ổn nhưng chưa đa dạng lắm.', N'Hiển thị'),
    ('DEMO-0027', 4, N'Phòng đẹp, giường êm. Wi-Fi đôi lúc chập chờn.', N'Hiển thị'),
    ('DEMO-0028', 4, N'Khách sạn tốt so với giá tiền, chỉ có thang máy hơi chậm giờ cao điểm.', N'Hiển thị'),
    ('DEMO-0029', 4, N'Khách sạn tốt so với giá tiền, chỉ có thang máy hơi chậm giờ cao điểm.', N'Hiển thị'),
    ('DEMO-0031', 5, N'Phòng sạch sẽ, view đẹp, nhân viên rất nhiệt tình. Chắc chắn sẽ quay lại!', N'Hiển thị'),
    ('DEMO-0032', 4, N'Khách sạn tốt so với giá tiền, chỉ có thang máy hơi chậm giờ cao điểm.', N'Hiển thị'),
    ('DEMO-0033', 4, N'Khách sạn tốt so với giá tiền, chỉ có thang máy hơi chậm giờ cao điểm.', N'Chờ duyệt'),
    ('DEMO-0035', 4, N'Nhân viên thân thiện, bữa sáng ổn nhưng chưa đa dạng lắm.', N'Hiển thị'),
    ('DEMO-0036', 5, N'Dịch vụ chu đáo, được nâng hạng phòng miễn phí. Rất hài lòng.', N'Hiển thị'),
    ('DEMO-0037', 5, N'Dịch vụ chu đáo, được nâng hạng phòng miễn phí. Rất hài lòng.', N'Hiển thị'),
    ('DEMO-0039', 5, N'Dịch vụ chu đáo, được nâng hạng phòng miễn phí. Rất hài lòng.', N'Hiển thị'),
    ('DEMO-0040', 5, N'Vị trí thuận tiện, check-in nhanh, phòng rộng hơn mong đợi.', N'Chờ duyệt')
) AS s (code, score, txt, st)
JOIN DAT_PHONG d ON d.MaXacNhanDatPhong = s.code AND d.TrangThai = N'Hoàn tất'
WHERE NOT EXISTS (SELECT 1 FROM DANH_GIA x WHERE x.MaDatPhong = d.MaDatPhong);

INSERT INTO HINH_ANH_DANH_GIA (MaDanhGia, URL)
SELECT g.MaDanhGia, s.url
FROM (VALUES
    ('DEMO-0003', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511928/hotel-booking/reviews/demo-review-01.jpg'),
    ('DEMO-0003', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511929/hotel-booking/reviews/demo-review-02.jpg'),
    ('DEMO-0004', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511929/hotel-booking/reviews/demo-review-03.jpg'),
    ('DEMO-0007', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511930/hotel-booking/reviews/demo-review-04.jpg'),
    ('DEMO-0008', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511930/hotel-booking/reviews/demo-review-05.jpg'),
    ('DEMO-0008', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511930/hotel-booking/reviews/demo-review-06.jpg'),
    ('DEMO-0009', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511931/hotel-booking/reviews/demo-review-07.jpg'),
    ('DEMO-0013', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511931/hotel-booking/reviews/demo-review-08.jpg'),
    ('DEMO-0015', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511931/hotel-booking/reviews/demo-review-09.jpg'),
    ('DEMO-0015', N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511932/hotel-booking/reviews/demo-review-10.jpg')
) AS s (code, url)
JOIN DAT_PHONG d ON d.MaXacNhanDatPhong = s.code
JOIN DANH_GIA g ON g.MaDatPhong = d.MaDatPhong
WHERE NOT EXISTS (SELECT 1 FROM HINH_ANH_DANH_GIA x WHERE x.MaDanhGia = g.MaDanhGia AND x.URL = s.url);

/* ---------------------------------------------------------- support requests (UC16 / UC38) */
INSERT INTO YEU_CAU_HO_TRO (MaTaiKhoanKhachHang, MaTaiKhoanXuLy, MaDatPhong, LoaiYeuCau, TieuDe, NoiDung, KetQuaXuLy, TrangThai, NgayTao, NgayXuLy)
SELECT c.MaTaiKhoan,
       CASE WHEN s.st = N'Mới' THEN NULL WHEN s.i % 2 = 0 THEN @admin ELSE @admin2 END,
       d.MaDatPhong, s.kind, s.title, s.body,
       CASE WHEN s.st = N'Đã xử lý' THEN s.result END,
       s.st,
       DATEADD(HOUR, 9 + s.i, CAST(DATEADD(DAY, s.dayOff, @today) AS DATETIME2)),
       CASE WHEN s.st = N'Đã xử lý' THEN DATEADD(HOUR, 30 + s.i, CAST(DATEADD(DAY, s.dayOff, @today) AS DATETIME2)) END
FROM (VALUES
    (N'demo_kh_an', N'Hỗ trợ', N'Xuất hóa đơn VAT cho đặt phòng', N'Công ty mình cần hóa đơn VAT cho kỳ lưu trú này, thông tin: Công ty TNHH ABC, MST 0312345678.', N'Mới', 'DEMO-0001', N'Đã hỗ trợ quý khách qua điện thoại và cập nhật thông tin theo yêu cầu.', -2, 0),
    (N'demo_kh_binh', N'Hỗ trợ', N'Muốn đổi ngày nhận phòng', N'Mình muốn lùi ngày nhận phòng thêm 2 ngày, có được giữ nguyên giá không?', N'Đang xử lý', 'DEMO-0003', N'Đã hỗ trợ quý khách qua điện thoại và cập nhật thông tin theo yêu cầu.', -4, 1),
    (N'demo_kh_cuong', N'Khiếu nại', N'Phòng không đúng như mô tả', N'Phòng thực tế nhỏ hơn và không có ban công như trong hình.', N'Đã xử lý', 'DEMO-0006', N'Đã xác minh với khách sạn, khách sạn cập nhật lại hình ảnh và hoàn 300.000đ phí chênh lệch cho quý khách.', -30, 2),
    (N'demo_kh_dung', N'Khiếu nại', N'Tiền hoàn chưa về tài khoản', N'Mình đã hủy phòng 5 ngày trước nhưng chưa nhận được tiền hoàn.', N'Đang xử lý', 'DEMO-0014', N'Đã hỗ trợ quý khách qua điện thoại và cập nhật thông tin theo yêu cầu.', -6, 3),
    (N'demo_kh_giang', N'Hỗ trợ', N'Hỏi về chính sách hủy phòng', N'Nếu mình hủy trước 30 tiếng thì được hoàn bao nhiêu phần trăm?', N'Đã xử lý', NULL, N'Theo chính sách hủy của đơn: hủy trước ≥48 giờ hoàn 100%, từ 24 đến dưới 48 giờ hoàn 50%, dưới 24 giờ không hoàn tiền.', -20, 4),
    (N'demo_kh_hai', N'Hỗ trợ', N'Không nhận được mã xác nhận', N'Thanh toán xong nhưng không thấy mã xác nhận đặt phòng.', N'Đã xử lý', 'DEMO-0004', N'Mã xác nhận hiển thị trong mục "Đặt phòng của tôi". Chúng tôi đã kiểm tra, đơn của quý khách đã được xác nhận thành công.', -45, 5),
    (N'demo_kh_hanh', N'Khiếu nại', N'Nhân viên lễ tân thiếu thân thiện', N'Lễ tân ca tối trả lời cộc lốc khi mình hỏi về dịch vụ giặt ủi.', N'Mới', 'DEMO-0028', N'Đã hỗ trợ quý khách qua điện thoại và cập nhật thông tin theo yêu cầu.', -1, 6),
    (N'demo_kh_hieu', N'Hỗ trợ', N'Yêu cầu giường phụ cho trẻ em', N'Gia đình mình có bé 5 tuổi, khách sạn có hỗ trợ giường phụ không?', N'Mới', NULL, N'Đã hỗ trợ quý khách qua điện thoại và cập nhật thông tin theo yêu cầu.', -3, 7),
    (N'demo_kh_huong', N'Khiếu nại', N'Phòng có mùi ẩm mốc', N'Phòng có mùi ẩm mốc rất khó chịu, xin đổi phòng nhưng không được hỗ trợ.', N'Đã xử lý', 'DEMO-0007', N'Đã làm việc với khách sạn, khách sạn xin lỗi và tặng voucher giảm 20% cho lần lưu trú tiếp theo.', -60, 8),
    (N'demo_kh_khanh', N'Hỗ trợ', N'Thanh toán bị trừ tiền nhưng đơn chưa xác nhận', N'Tài khoản đã bị trừ tiền nhưng trạng thái đơn vẫn là chờ thanh toán.', N'Đang xử lý', 'DEMO-0011', N'Đã hỗ trợ quý khách qua điện thoại và cập nhật thông tin theo yêu cầu.', -2, 9),
    (N'demo_kh_linh', N'Hỗ trợ', N'Cập nhật số điện thoại liên hệ', N'Mình đổi số điện thoại, nhờ cập nhật vào đơn đặt phòng giúp.', N'Mới', 'DEMO-0026', N'Đã hỗ trợ quý khách qua điện thoại và cập nhật thông tin theo yêu cầu.', -1, 10),
    (N'demo_kh_mai', N'Khiếu nại', N'Khuyến mãi không áp dụng được', N'Mã CUOITUAN15 báo không hợp lệ dù đơn của mình trên 2 triệu.', N'Đã xử lý', NULL, N'Mã CUOITUAN15 yêu cầu tổng tiền phòng trước giảm giá từ 2.000.000đ; đơn của quý khách chưa đạt ngưỡng nên hệ thống từ chối đúng quy định.', -12, 11),
    (N'demo_kh_nam', N'Hỗ trợ', N'Hỏi về dịch vụ đưa đón sân bay', N'Khách sạn có xe đón ở sân bay Đà Nẵng lúc 23h không?', N'Mới', NULL, N'Đã hỗ trợ quý khách qua điện thoại và cập nhật thông tin theo yêu cầu.', -5, 12),
    (N'demo_kh_quynh', N'Khiếu nại', N'Bị tính thêm phí không báo trước', N'Khi trả phòng mình bị thu thêm phí dịch vụ 10% không được thông báo.', N'Đang xử lý', 'DEMO-0025', N'Đã hỗ trợ quý khách qua điện thoại và cập nhật thông tin theo yêu cầu.', -8, 13)
) AS s (u, kind, title, body, st, code, result, dayOff, i)
JOIN TAI_KHOAN c ON c.TenDangNhap = s.u
LEFT JOIN DAT_PHONG d ON d.MaXacNhanDatPhong = s.code AND d.MaTaiKhoanKhachHang = c.MaTaiKhoan
WHERE NOT EXISTS (SELECT 1 FROM YEU_CAU_HO_TRO y WHERE y.MaTaiKhoanKhachHang = c.MaTaiKhoan AND y.TieuDe = s.title);

/* ---------------------------------------------------------- replace placeholder (picsum.photos) images from the older discovery seed */
;WITH legacy AS (SELECT MaHinhAnh, ROW_NUMBER() OVER (ORDER BY MaHinhAnh) AS rn FROM HINH_ANH_KHACH_SAN WHERE URL LIKE N'https://picsum.photos/%'),
      pics AS (SELECT url, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn FROM (VALUES (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511827/hotel-booking/hotels/demo-exterior-31.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511827/hotel-booking/hotels/demo-exterior-32.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511827/hotel-booking/hotels/demo-exterior-33.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511828/hotel-booking/hotels/demo-exterior-34.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511829/hotel-booking/hotels/demo-exterior-35.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511829/hotel-booking/hotels/demo-exterior-36.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511829/hotel-booking/hotels/demo-exterior-37.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511830/hotel-booking/hotels/demo-exterior-38.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511831/hotel-booking/hotels/demo-exterior-39.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511830/hotel-booking/hotels/demo-exterior-40.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511816/hotel-booking/hotels/demo-exterior-01.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511816/hotel-booking/hotels/demo-exterior-02.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511816/hotel-booking/hotels/demo-exterior-03.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511816/hotel-booking/hotels/demo-exterior-04.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511818/hotel-booking/hotels/demo-exterior-05.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511818/hotel-booking/hotels/demo-exterior-06.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511818/hotel-booking/hotels/demo-exterior-07.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511818/hotel-booking/hotels/demo-exterior-08.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511819/hotel-booking/hotels/demo-exterior-09.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511819/hotel-booking/hotels/demo-exterior-10.jpg')) v (url))
UPDATE i SET URL = p.url
FROM HINH_ANH_KHACH_SAN i JOIN legacy l ON l.MaHinhAnh = i.MaHinhAnh JOIN pics p ON p.rn = ((l.rn - 1) % 20) + 1;

;WITH legacy AS (SELECT MaHinhAnhLoaiPhong, ROW_NUMBER() OVER (ORDER BY MaHinhAnhLoaiPhong) AS rn FROM HINH_ANH_LOAI_PHONG WHERE URL LIKE N'https://picsum.photos/%'),
      pics AS (SELECT url, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn FROM (VALUES (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511928/hotel-booking/room-types/demo-room-39.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511928/hotel-booking/room-types/demo-room-40.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511915/hotel-booking/room-types/demo-room-01.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511915/hotel-booking/room-types/demo-room-02.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511916/hotel-booking/room-types/demo-room-03.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-04.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511916/hotel-booking/room-types/demo-room-05.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511916/hotel-booking/room-types/demo-room-06.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-07.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-08.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511917/hotel-booking/room-types/demo-room-09.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511918/hotel-booking/room-types/demo-room-10.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511918/hotel-booking/room-types/demo-room-11.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511919/hotel-booking/room-types/demo-room-12.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511919/hotel-booking/room-types/demo-room-13.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511919/hotel-booking/room-types/demo-room-14.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511920/hotel-booking/room-types/demo-room-15.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511920/hotel-booking/room-types/demo-room-16.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-17.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-18.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511951/hotel-booking/room-types/demo-room-19.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-20.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511921/hotel-booking/room-types/demo-room-21.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511922/hotel-booking/room-types/demo-room-22.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511922/hotel-booking/room-types/demo-room-23.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511923/hotel-booking/room-types/demo-room-24.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511923/hotel-booking/room-types/demo-room-25.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511923/hotel-booking/room-types/demo-room-26.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511924/hotel-booking/room-types/demo-room-27.jpg'), (N'https://res.cloudinary.com/dfyfpuguj/image/upload/v1790511924/hotel-booking/room-types/demo-room-28.jpg')) v (url))
UPDATE i SET URL = p.url
FROM HINH_ANH_LOAI_PHONG i JOIN legacy l ON l.MaHinhAnhLoaiPhong = i.MaHinhAnhLoaiPhong JOIN pics p ON p.rn = ((l.rn - 1) % 30) + 1;

COMMIT TRANSACTION;

SELECT N'demo seed OK' AS status,
       (SELECT COUNT(*) FROM TAI_KHOAN WHERE TenDangNhap LIKE N'demo[_]%') AS demo_accounts,
       (SELECT COUNT(*) FROM #hotel) AS demo_hotels,
       (SELECT COUNT(*) FROM #room) AS demo_room_types,
       (SELECT COUNT(*) FROM DAT_PHONG WHERE MaXacNhanDatPhong LIKE 'DEMO-%') AS demo_bookings;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
