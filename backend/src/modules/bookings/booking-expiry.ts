/**
 * M6 §2 — a DAT_PHONG left in "Chờ thanh toán" must not hold a room forever.
 * No new column is added for this (M5/M6 keep the existing schema — see M6
 * report §3): the existing NgayTao + TrangThai are enough. A booking is
 * "expired" once it has been PENDING_PAYMENT for longer than
 * PAYMENT_TIMEOUT_MINUTES; expiring it means flipping it straight to the
 * existing "Đã hủy" status (not a new status value) — cancelled bookings
 * already free inventory via every TrangThai <> 'Đã hủy' check across the
 * codebase (availability, quote, booking creation, payment, refund), so
 * this one write is the single source of truth everywhere at once.
 *
 * Called lazily (no cron/timer) at every touchpoint that reads booking
 * status or inventory: booking creation (before locking rates), payment
 * creation/status, and booking list/detail/cancel. Idempotent — a booking
 * that is not PENDING_PAYMENT (or not old enough) is simply not matched.
 */
import { Prisma } from '../../generated/prisma/client';
import { BOOKING_STATUS } from '../../common/constants/hotel-status';
import { env } from '../../config/env';

const EXPIRY_NOTE = 'Tự động hủy do quá hạn thanh toán';

/** Structural type so this runs against either a bare PrismaClient or an open transaction. */
type RawExecutor = { $executeRaw(query: Prisma.Sql): Promise<number> };

export const expireStalePendingBookings = async (
  db: RawExecutor,
  now: Date = new Date()
): Promise<number> => {
  const cutoff = new Date(now.getTime() - env.PAYMENT_TIMEOUT_MINUTES * 60_000);
  const result = await db.$executeRaw(Prisma.sql`
    UPDATE DAT_PHONG
    SET TrangThai = ${BOOKING_STATUS.CANCELLED},
        NgayCapNhat = ${now},
        GhiChu = CASE WHEN GhiChu IS NULL THEN ${EXPIRY_NOTE} ELSE GhiChu + N' | ' + ${EXPIRY_NOTE} END
    WHERE TrangThai = ${BOOKING_STATUS.PENDING_PAYMENT} AND NgayTao < ${cutoff}
  `);
  return Number(result);
};
