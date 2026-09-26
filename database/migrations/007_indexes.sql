-- =====================================================================
-- DB-6 Migration 007: Indexes (M8)
-- No table/column changes — every index here is additive (CREATE INDEX
-- only) and was chosen from an actual audit of M1-M8 query/filter/join/sort
-- patterns (see docs/m8-report.md §4), not added speculatively. Every
-- foreign key column in this schema is otherwise UNindexed by default —
-- SQL Server (unlike some engines) never auto-indexes a FK — so this fixes
-- a real, accumulated gap rather than a hypothetical one.
-- Depends on: 001-006 (all tables already exist).
-- =====================================================================

-- Required by the filtered index below (IX_DAT_PHONG_MaKhuyenMai) — SQL
-- Server rejects a filtered index unless QUOTED_IDENTIFIER is ON for the session.
SET QUOTED_IDENTIFIER ON;
GO

-- -----------------------------------------------------------------
-- DAT_PHONG
-- -----------------------------------------------------------------

-- booking-expiry.ts's lazy sweep: UPDATE ... WHERE TrangThai='Chờ thanh toán'
-- AND NgayTao < cutoff — runs at the top of nearly every booking/payment/
-- review/support request (createBooking, listMyBookings, getBookingDetail,
-- cancelBooking, createVnpayPayment, getPaymentStatus). Without this index
-- every one of those calls does a full scan of DAT_PHONG.
CREATE INDEX IX_DAT_PHONG_TrangThai_NgayTao ON DAT_PHONG (TrangThai, NgayTao);
GO

-- booking-completion.ts's lazy sweep: UPDATE ... WHERE TrangThai='Đã xác nhận'
-- AND NgayTraPhong < now — same call sites as above, plus reviews.service.ts's
-- eligibility check (RB9: a booking must be "Hoàn tất" before it can be reviewed).
CREATE INDEX IX_DAT_PHONG_TrangThai_NgayTraPhong ON DAT_PHONG (TrangThai, NgayTraPhong);
GO

-- bookings.repository.ts listByCustomer — every visit to "Quản lý đặt phòng"
-- (GET /bookings), filtered by the signed-in customer and sorted by NgayTao desc.
CREATE INDEX IX_DAT_PHONG_MaTaiKhoanKhachHang_NgayTao ON DAT_PHONG (MaTaiKhoanKhachHang, NgayTao DESC);
GO

-- M8 owner/admin analytics (analytics.repository.ts countBookingsByStatus/
-- topRoomTypes) — every owner-analytics request filters by MaKhachSan and a
-- NgayTao date range; admin analytics uses the NgayTao range alone (leading
-- column still usable without an equality predicate on it).
CREATE INDEX IX_DAT_PHONG_MaKhachSan_NgayTao ON DAT_PHONG (MaKhachSan, NgayTao);
GO

-- bookings/quotes countPromotionUsage — every booking/quote that applies a
-- promo code checks how many times that code has already been used.
CREATE INDEX IX_DAT_PHONG_MaKhuyenMai ON DAT_PHONG (MaKhuyenMai) WHERE MaKhuyenMai IS NOT NULL;
GO

-- -----------------------------------------------------------------
-- CHI_TIET_DAT_PHONG
-- -----------------------------------------------------------------

-- The core availability computation (bookings.repository.ts
-- findBookedQuantities; hotels.repository.ts roomTypeInclude, shared by
-- hotel search, hotel detail, and quotes) filters by MaLoaiPhong IN (...)
-- before joining back to DAT_PHONG for status/date — hit on every search,
-- every quote, every booking attempt. Also M8's topRoomTypes groupBy.
CREATE INDEX IX_CHI_TIET_DAT_PHONG_MaLoaiPhong ON CHI_TIET_DAT_PHONG (MaLoaiPhong);
GO

-- -----------------------------------------------------------------
-- LOAI_PHONG
-- -----------------------------------------------------------------

-- Room-type lookups for a hotel, filtered by status, appear in nearly every
-- discovery/booking-creation query (bookings.repository.ts
-- findActiveRoomTypesByIds; hotels.repository.ts findRoomTypesForHotel;
-- quotes.repository.ts findRoomTypesByIds; owner-room-types.repository.ts
-- listForHotel) and M8's occupancy (LOAI_PHONG.MaKhachSan → room type ids).
CREATE INDEX IX_LOAI_PHONG_MaKhachSan_TrangThai ON LOAI_PHONG (MaKhachSan, TrangThai);
GO

-- -----------------------------------------------------------------
-- KHACH_SAN
-- -----------------------------------------------------------------

-- Public hotel search (hotels.repository.ts findCandidateHotels) filters to
-- TrangThai='Hoạt động' before anything else — the highest-traffic public
-- endpoint in the app.
CREATE INDEX IX_KHACH_SAN_TrangThai ON KHACH_SAN (TrangThai);
GO

-- Owner dashboard (owner-hotels.repository.ts listByOwner) — every owner
-- login/dashboard visit, filtered by owner and sorted by NgayDangKy desc.
CREATE INDEX IX_KHACH_SAN_MaTaiKhoanSoHuu_NgayDangKy ON KHACH_SAN (MaTaiKhoanSoHuu, NgayDangKy DESC);
GO

-- -----------------------------------------------------------------
-- THANH_TOAN
-- -----------------------------------------------------------------

-- Every booking-detail/cancel/payment-status view looks up THANH_TOAN by
-- its booking (bookings.repository.ts findSuccessfulPayment;
-- payments.repository.ts findExistingSuccessfulPayment,
-- findPaymentsWithRefundsForBooking).
CREATE INDEX IX_THANH_TOAN_MaDatPhong ON THANH_TOAN (MaDatPhong);
GO

-- payments.repository.ts findPaymentByTxnRef uses `MaGiaoDichDoiTac
-- STARTSWITH @txnRef` (a leftmost-anchored LIKE, so it IS sargable via a
-- normal index) — the lookup on every VNPAY return-URL hit and every IPN
-- callback, a server-to-server path that must not degrade as THANH_TOAN grows.
CREATE INDEX IX_THANH_TOAN_MaGiaoDichDoiTac ON THANH_TOAN (MaGiaoDichDoiTac);
GO

-- M8 revenue reports (analytics.repository.ts sumSuccessfulPayments;
-- admin-analytics.repository.ts countPaymentsByStatus) — TrangThai='Thành
-- công' plus a ThoiGianGiaoDich date range, both owner- and admin-scoped.
CREATE INDEX IX_THANH_TOAN_TrangThai_ThoiGianGiaoDich ON THANH_TOAN (TrangThai, ThoiGianGiaoDich);
GO

-- -----------------------------------------------------------------
-- HOAN_TIEN
-- -----------------------------------------------------------------

-- Every booking-detail/cancel/retry-refund call looks up HOAN_TIEN by its
-- payment (payments.repository.ts sumSuccessfulRefunds and the refund
-- insert/read paths in bookings.repository.ts / payments.service.ts).
CREATE INDEX IX_HOAN_TIEN_MaThanhToan ON HOAN_TIEN (MaThanhToan);
GO

-- M8 refund reports (analytics.repository.ts sumSuccessfulRefunds;
-- admin-analytics.repository.ts countRefundsByStatus) — same shape as the
-- THANH_TOAN date-range index above, on NgayHoanTien/NgayYeuCau respectively.
CREATE INDEX IX_HOAN_TIEN_TrangThai_NgayHoanTien ON HOAN_TIEN (TrangThai, NgayHoanTien);
GO

-- -----------------------------------------------------------------
-- YEU_CAU_HO_TRO
-- -----------------------------------------------------------------

-- support.repository.ts listByCustomer — every visit to "Hỗ trợ & khiếu
-- nại" (GET /support), filtered by the signed-in customer and sorted by
-- NgayTao desc.
CREATE INDEX IX_YEU_CAU_HO_TRO_MaTaiKhoanKhachHang_NgayTao ON YEU_CAU_HO_TRO (MaTaiKhoanKhachHang, NgayTao DESC);
GO
