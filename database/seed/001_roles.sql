-- =====================================================================
-- DB-1 seed: VAI_TRO baseline roles
-- Idempotent: safe to run multiple times against the same database.
--
-- Only the roles actually used by real accounts in the current design are
-- seeded (Customer, Hotel Owner/Partner, System Admin). Per M1 instructions:
-- Guest/anonymous is NOT a database account and gets no role row here, and
-- no CSKH/Employee/HotelStaff/Moderator role is invented — the ERD/use
-- cases do not call for one (G0-09).
-- =====================================================================

MERGE VAI_TRO AS target
USING (VALUES
    (N'Khách hàng', N'Người dùng đặt phòng trên nền tảng'),
    (N'Chủ khách sạn', N'Đối tác sở hữu và quản lý khách sạn trên nền tảng'),
    (N'Quản trị hệ thống', N'Quản trị viên vận hành nền tảng')
) AS source (TenVaiTro, MoTa)
ON target.TenVaiTro = source.TenVaiTro
WHEN NOT MATCHED THEN
    INSERT (TenVaiTro, MoTa) VALUES (source.TenVaiTro, source.MoTa);
GO
