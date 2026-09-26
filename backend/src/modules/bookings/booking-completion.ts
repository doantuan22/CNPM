/**
 * M7 §1 (RB9) — "Đánh giá chỉ được tạo cho đơn đặt phòng đã hoàn tất thời
 * gian lưu trú... Đơn phải ở trạng thái hoàn tất" — i.e. DAT_PHONG.TrangThai
 * must actually be "Hoàn tất", not just CONFIRMED with a past NgayTraPhong.
 * Nothing before M7 ever transitions a booking into "Hoàn tất" — there is no
 * check-in/check-out staff action in this system, so the only signal
 * available is the stay's own end date.
 *
 * Same lazy-sweep approach as booking-expiry.ts (M6 §2): no cron/timer, no
 * new column — one UPDATE guarded by existing TrangThai + NgayTraPhong, run
 * at every read/write touchpoint that cares about a booking's current
 * status (list/detail, review eligibility, cancel).
 */
import { Prisma } from '../../generated/prisma/client';
import { BOOKING_STATUS } from '../../common/constants/hotel-status';

type RawExecutor = { $executeRaw(query: Prisma.Sql): Promise<number> };

export const completeFinishedBookings = async (db: RawExecutor, now: Date = new Date()): Promise<number> => {
  const result = await db.$executeRaw(Prisma.sql`
    UPDATE DAT_PHONG
    SET TrangThai = ${BOOKING_STATUS.COMPLETED},
        NgayCapNhat = ${now}
    WHERE TrangThai = ${BOOKING_STATUS.CONFIRMED} AND NgayTraPhong < ${now}
  `);
  return Number(result);
};
