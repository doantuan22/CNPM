import { z } from 'zod';
import { BOOKING_STATUS } from '../../common/constants/hotel-status';

export const ownerBookingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  trangThai: z.enum([BOOKING_STATUS.PENDING_PAYMENT, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().trim().min(1).max(30).optional(),
}).refine((value) => !value.from || !value.to || value.from <= value.to, { message: 'Khoảng ngày không hợp lệ', path: ['to'] });
export type OwnerBookingsQuery = z.infer<typeof ownerBookingsQuerySchema>;

export const ownerBookingParamsSchema = z.object({
  hotelId: z.coerce.number().int().positive(),
  bookingId: z.coerce.number().int().positive(),
});
