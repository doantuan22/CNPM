import { getPrismaClient } from '../../config/prisma';
import { Prisma } from '../../generated/prisma/client';
import { HOTEL_STATUS, ROOM_TYPE_STATUS, ROOM_RATE_STATUS, BOOKING_STATUS } from '../../common/constants/hotel-status';
import { CANCELLATION_POLICY_STATUS } from '../../common/constants/commercial';

export interface LockedRateRow {
  MaLoaiPhong: number;
  NgayApDung: Date;
  GiaPhong: number;
  SoLuongPhong: number;
}

export interface BookedRow {
  MaLoaiPhong: number;
  SoLuongPhong: number;
  NgayNhanPhong: Date;
  NgayTraPhong: Date;
}

export interface InsertBookingData {
  maXacNhanDatPhong: string;
  maTaiKhoanKhachHang: number;
  maKhachSan: number;
  maKhuyenMai: number | null;
  maChinhSachHuy: number;
  ngayNhanPhong: Date;
  ngayTraPhong: Date;
  tongTienPhong: number;
  soTienGiam: number;
  tongTienThanhToan: number;
  ghiChu: string | null;
}

export class BookingsRepository {
  async findActiveHotel(maKhachSan: number) {
    const prisma = getPrismaClient();
    return prisma.kHACH_SAN.findFirst({ where: { MaKhachSan: maKhachSan, TrangThai: HOTEL_STATUS.ACTIVE } });
  }

  async findActiveRoomTypesByIds(maKhachSan: number, ids: number[]) {
    const prisma = getPrismaClient();
    return prisma.lOAI_PHONG.findMany({
      where: { MaKhachSan: maKhachSan, MaLoaiPhong: { in: ids }, TrangThai: ROOM_TYPE_STATUS.ACTIVE },
      select: { MaLoaiPhong: true, TenLoaiPhong: true },
    });
  }

  async runInTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    const prisma = getPrismaClient();
    return prisma.$transaction(fn);
  }

  /**
   * Gates concurrent bookings for the same room type(s)/date range. Locks
   * every matching QUY_PHONG_GIA row with WITH (UPDLOCK, ROWLOCK, HOLDLOCK):
   * a second transaction requesting an overlapping room type + date range
   * blocks on this SELECT until this transaction commits or rolls back, then
   * re-reads the now-committed booked count. U-locks (unlike shared locks)
   * are mutually exclusive, so this serializes competing bookings at the
   * read step instead of racing on the later INSERT (see M5 report §2).
   */
  async lockRatesForUpdate(
    tx: Prisma.TransactionClient,
    maLoaiPhongIds: number[],
    checkIn: Date,
    checkOut: Date
  ): Promise<LockedRateRow[]> {
    return tx.$queryRaw<LockedRateRow[]>(Prisma.sql`
      SELECT MaLoaiPhong, NgayApDung, GiaPhong, SoLuongPhong
      FROM QUY_PHONG_GIA WITH (UPDLOCK, ROWLOCK, HOLDLOCK)
      WHERE MaLoaiPhong IN (${Prisma.join(maLoaiPhongIds)})
        AND TrangThai = ${ROOM_RATE_STATUS.OPEN_FOR_SALE}
        AND NgayApDung >= ${checkIn} AND NgayApDung < ${checkOut}
      ORDER BY MaLoaiPhong, NgayApDung
    `);
  }

  /** Rooms already occupied by non-cancelled bookings overlapping the stay — read after the gating lock above is held. */
  async findBookedQuantities(
    tx: Prisma.TransactionClient,
    maLoaiPhongIds: number[],
    checkIn: Date,
    checkOut: Date
  ): Promise<BookedRow[]> {
    const rows = await tx.cHI_TIET_DAT_PHONG.findMany({
      where: {
        MaLoaiPhong: { in: maLoaiPhongIds },
        DAT_PHONG: {
          TrangThai: { not: BOOKING_STATUS.CANCELLED },
          NgayNhanPhong: { lt: checkOut },
          NgayTraPhong: { gt: checkIn },
        },
      },
      select: {
        MaLoaiPhong: true,
        SoLuongPhong: true,
        DAT_PHONG: { select: { NgayNhanPhong: true, NgayTraPhong: true } },
      },
    });
    return rows.map((r) => ({
      MaLoaiPhong: r.MaLoaiPhong,
      SoLuongPhong: r.SoLuongPhong,
      NgayNhanPhong: r.DAT_PHONG.NgayNhanPhong,
      NgayTraPhong: r.DAT_PHONG.NgayTraPhong,
    }));
  }

  async findPromotionByCode(tx: Prisma.TransactionClient, maCode: string) {
    return tx.kHUYEN_MAI.findUnique({ where: { MaCode: maCode } });
  }

  async countPromotionUsage(tx: Prisma.TransactionClient, maKhuyenMai: number): Promise<number> {
    return tx.dAT_PHONG.count({ where: { MaKhuyenMai: maKhuyenMai, TrangThai: { not: BOOKING_STATUS.CANCELLED } } });
  }

  /** Same resolution rule as M4 (oldest still-active policy) — re-read fresh inside the transaction, never trusted from a prior quote. */
  async findActiveCancellationPolicy(tx: Prisma.TransactionClient) {
    return tx.cHINH_SACH_HUY.findFirst({
      where: { TrangThai: CANCELLATION_POLICY_STATUS.ACTIVE },
      include: { CHI_TIET_CHINH_SACH_HUY: { orderBy: { SoGioTruocNhanPhong: 'desc' } } },
      orderBy: { MaChinhSachHuy: 'asc' },
    });
  }

  async insertBooking(tx: Prisma.TransactionClient, data: InsertBookingData) {
    const now = new Date();
    return tx.dAT_PHONG.create({
      data: {
        MaXacNhanDatPhong: data.maXacNhanDatPhong,
        TAI_KHOAN: { connect: { MaTaiKhoan: data.maTaiKhoanKhachHang } },
        KHACH_SAN: { connect: { MaKhachSan: data.maKhachSan } },
        ...(data.maKhuyenMai ? { KHUYEN_MAI: { connect: { MaKhuyenMai: data.maKhuyenMai } } } : {}),
        CHINH_SACH_HUY: { connect: { MaChinhSachHuy: data.maChinhSachHuy } },
        NgayNhanPhong: data.ngayNhanPhong,
        NgayTraPhong: data.ngayTraPhong,
        TongTienPhong: data.tongTienPhong,
        SoTienGiam: data.soTienGiam,
        TongTienThanhToan: data.tongTienThanhToan,
        GhiChu: data.ghiChu,
        TrangThai: BOOKING_STATUS.PENDING_PAYMENT,
        NgayTao: now,
        NgayCapNhat: now,
      },
    });
  }

  async insertBookingLines(
    tx: Prisma.TransactionClient,
    maDatPhong: number,
    lines: Array<{ maLoaiPhong: number; soLuong: number }>
  ): Promise<void> {
    await tx.cHI_TIET_DAT_PHONG.createMany({
      data: lines.map((l) => ({ MaDatPhong: maDatPhong, MaLoaiPhong: l.maLoaiPhong, SoLuongPhong: l.soLuong })),
    });
  }
}
