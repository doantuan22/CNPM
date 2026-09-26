import { getPrismaClient } from '../../config/prisma';
import { Prisma } from '../../generated/prisma/client';
import { BOOKING_STATUS } from '../../common/constants/hotel-status';
import { PAYMENT_STATUS } from '../../common/constants/payment';

export interface InsertPaymentData {
  maDatPhong: number;
  soTien: number;
  phuongThucThanhToan: string;
  maGiaoDichDoiTac: string;
  trangThai: string;
  thoiGianGiaoDich: Date;
}

export class PaymentsRepository {
  async findBookingById(maDatPhong: number) {
    const prisma = getPrismaClient();
    return prisma.dAT_PHONG.findUnique({ where: { MaDatPhong: maDatPhong } });
  }

  async insertPayment(data: InsertPaymentData) {
    const prisma = getPrismaClient();
    return prisma.tHANH_TOAN.create({
      data: {
        MaDatPhong: data.maDatPhong,
        SoTien: data.soTien,
        PhuongThucThanhToan: data.phuongThucThanhToan,
        MaGiaoDichDoiTac: data.maGiaoDichDoiTac,
        TrangThai: data.trangThai,
        ThoiGianGiaoDich: data.thoiGianGiaoDich,
      },
    });
  }

  async findExistingSuccessfulPayment(maDatPhong: number) {
    const prisma = getPrismaClient();
    return prisma.tHANH_TOAN.findFirst({ where: { MaDatPhong: maDatPhong, TrangThai: PAYMENT_STATUS.SUCCESS } });
  }

  /**
   * Looks up by prefix because MaGiaoDichDoiTac is our vnp_TxnRef at creation
   * time, then gets rewritten to `txnRef:transactionNo:payDate` once VNPAY
   * confirms it (see vnpay.ts encodeGatewayRef) — both forms start with the
   * same txnRef, so a startsWith match finds the row regardless of which
   * callback (return vs IPN) arrives first or how many times it repeats.
   */
  async findPaymentByTxnRef(tx: Prisma.TransactionClient, txnRef: string) {
    return tx.tHANH_TOAN.findFirst({ where: { MaGiaoDichDoiTac: { startsWith: txnRef } } });
  }

  async markPaymentOutcome(tx: Prisma.TransactionClient, maThanhToan: number, trangThai: string, maGiaoDichDoiTac?: string) {
    return tx.tHANH_TOAN.update({
      where: { MaThanhToan: maThanhToan },
      data: { TrangThai: trangThai, ...(maGiaoDichDoiTac ? { MaGiaoDichDoiTac: maGiaoDichDoiTac } : {}) },
    });
  }

  /** Guarded — only flips a booking that is still PENDING_PAYMENT; returns 0 if it already expired/was cancelled/was already confirmed (idempotent, race-safe). */
  async confirmBookingIfPending(tx: Prisma.TransactionClient, maDatPhong: number, now: Date): Promise<number> {
    const res = await tx.dAT_PHONG.updateMany({
      where: { MaDatPhong: maDatPhong, TrangThai: BOOKING_STATUS.PENDING_PAYMENT },
      data: { TrangThai: BOOKING_STATUS.CONFIRMED, NgayCapNhat: now },
    });
    return res.count;
  }

  async findPaymentsWithRefundsForBooking(maDatPhong: number) {
    const prisma = getPrismaClient();
    return prisma.tHANH_TOAN.findMany({
      where: { MaDatPhong: maDatPhong },
      orderBy: { ThoiGianGiaoDich: 'desc' },
      include: { HOAN_TIEN: { orderBy: { NgayYeuCau: 'desc' } } },
    });
  }

  async insertRefund(
    tx: Prisma.TransactionClient,
    data: { maThanhToan: number; soTienHoan: number; lyDoHoanTien: string; maGiaoDichDoiTac: string; trangThai: string; ngayYeuCau: Date }
  ) {
    return tx.hOAN_TIEN.create({
      data: {
        MaThanhToan: data.maThanhToan,
        SoTienHoan: data.soTienHoan,
        LyDoHoanTien: data.lyDoHoanTien,
        MaGiaoDichDoiTac: data.maGiaoDichDoiTac,
        TrangThai: data.trangThai,
        NgayYeuCau: data.ngayYeuCau,
      },
    });
  }

  async sumSuccessfulRefunds(tx: Prisma.TransactionClient, maThanhToan: number): Promise<number> {
    const rows = await tx.hOAN_TIEN.findMany({
      where: { MaThanhToan: maThanhToan, TrangThai: PAYMENT_STATUS.SUCCESS },
      select: { SoTienHoan: true },
    });
    return rows.reduce((sum, r) => sum + Number(r.SoTienHoan), 0);
  }

  /** Includes the ownership chain (HOAN_TIEN → THANH_TOAN → DAT_PHONG) so the service can check MaTaiKhoanKhachHang without a second round trip. */
  async findRefundWithOwnership(maHoanTien: number) {
    const prisma = getPrismaClient();
    return prisma.hOAN_TIEN.findUnique({
      where: { MaHoanTien: maHoanTien },
      include: { THANH_TOAN: { include: { DAT_PHONG: true } } },
    });
  }

  async markRefundOutcome(tx: Prisma.TransactionClient, maHoanTien: number, trangThai: string, ngayHoanTien: Date | null) {
    return tx.hOAN_TIEN.update({ where: { MaHoanTien: maHoanTien }, data: { TrangThai: trangThai, NgayHoanTien: ngayHoanTien } });
  }

  async runInTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    const prisma = getPrismaClient();
    return prisma.$transaction(fn);
  }
}
