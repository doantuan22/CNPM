-- =====================================================================
-- Migration 008: BUG-001 — promotion usage-limit race in booking creation
-- No table/column/index changes — one stored procedure only.
-- Depends on: 004 (KHUYEN_MAI), 005 (DAT_PHONG), 007 (IX_DAT_PHONG_MaKhuyenMai).
--
-- Root cause: createBooking used to read the promo and COUNT its usage
-- (READ COMMITTED, no lock on KHUYEN_MAI) and only later INSERT the booking.
-- The only lock taken was on QUY_PHONG_GIA, which serialises bookings of the
-- SAME room type but not bookings of DIFFERENT room types that share one
-- promo code. N concurrent transactions therefore all counted the same
-- "used" total (e.g. 0 of 2) before any of them committed, and all inserted.
--
-- Fix: the booking transaction first takes UPDLOCK+HOLDLOCK+ROWLOCK on the
-- promo's own KHUYEN_MAI row. Every booking that uses that promo now queues
-- on this one row, so by the time a transaction gets the lock every earlier
-- promo booking is committed (visible to the COUNT) or rolled back.
--
-- Lock order for every booking-creation transaction (bookings.service.ts):
--   [expireStalePendingBookings sweep — status flip only]
--   1. KHUYEN_MAI row            (this procedure; only when a promo is used)
--   2. QUY_PHONG_GIA rows        (bookings.repository.ts lockRatesForUpdate)
--   3. INSERT DAT_PHONG -> CHI_TIET_DAT_PHONG
-- A booking without a promo skips step 1; the order is never inverted, so
-- transactions that share only some of the resources cannot deadlock.
-- =====================================================================

CREATE OR ALTER PROCEDURE dbo.usp_KhoaKhuyenMaiChoDatPhong
    @MaCode VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- The caller owns the transaction (BEGIN/COMMIT/ROLLBACK are issued by the
    -- booking transaction so the lock below is held until the DAT_PHONG insert
    -- commits). Without an open transaction the lock would be released the
    -- moment this procedure returns and the guarantee would silently vanish.
    BEGIN TRY
        IF @@TRANCOUNT = 0
            THROW 50010, N'usp_KhoaKhuyenMaiChoDatPhong phải được gọi bên trong một transaction đang mở.', 1;

        DECLARE @MaKhuyenMai       INT,
                @LoaiGiamGia       NVARCHAR(20),
                @GiaTriGiam        DECIMAL(14,2),
                @GiaTriDonToiThieu DECIMAL(14,2),
                @MucGiamToiDa      DECIMAL(14,2),
                @SoLuongGioiHan    INT,
                @NgayBatDau        DATE,
                @NgayKetThuc       DATE,
                @TrangThai         NVARCHAR(30),
                @DaDung            INT;

        -- Lock FIRST, read/validate/count only after the lock is held.
        SELECT @MaKhuyenMai       = MaKhuyenMai,
               @LoaiGiamGia       = LoaiGiamGia,
               @GiaTriGiam        = GiaTriGiam,
               @GiaTriDonToiThieu = GiaTriDonToiThieu,
               @MucGiamToiDa      = MucGiamToiDa,
               @SoLuongGioiHan    = SoLuongGioiHan,
               @NgayBatDau        = NgayBatDau,
               @NgayKetThuc       = NgayKetThuc,
               @TrangThai         = TrangThai
        FROM KHUYEN_MAI WITH (UPDLOCK, HOLDLOCK, ROWLOCK)
        WHERE MaCode = @MaCode;

        IF @MaKhuyenMai IS NULL
            THROW 50011, N'Mã khuyến mãi không tồn tại', 1;

        -- Cancelled bookings never count toward the limit (existing business rule).
        SELECT @DaDung = COUNT(*)
        FROM DAT_PHONG
        WHERE MaKhuyenMai = @MaKhuyenMai
          AND TrangThai <> N'Đã hủy';

        IF @SoLuongGioiHan > 0 AND @DaDung >= @SoLuongGioiHan
            THROW 50012, N'Mã khuyến mãi đã hết lượt sử dụng', 1;

        SELECT @MaKhuyenMai       AS MaKhuyenMai,
               @MaCode            AS MaCode,
               @LoaiGiamGia       AS LoaiGiamGia,
               @GiaTriGiam        AS GiaTriGiam,
               @GiaTriDonToiThieu AS GiaTriDonToiThieu,
               @MucGiamToiDa      AS MucGiamToiDa,
               @SoLuongGioiHan    AS SoLuongGioiHan,
               @NgayBatDau        AS NgayBatDau,
               @NgayKetThuc       AS NgayKetThuc,
               @TrangThai         AS TrangThai,
               @DaDung            AS DaDung;
    END TRY
    BEGIN CATCH
        -- Do NOT roll back here: the transaction belongs to the caller, and
        -- rolling back an outer transaction from inside a procedure leaves the
        -- caller with a trancount mismatch that masks the real error.
        -- XACT_ABORT ON has already doomed the transaction; the caller's
        -- ROLLBACK discards the whole booking attempt. Re-raise unchanged.
        THROW;
    END CATCH
END
GO
