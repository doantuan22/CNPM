/** DAT_PHONG.TrangThai — mirrors backend/src/common/constants/hotel-status.ts BOOKING_STATUS. "Thành công" belongs to payments, not bookings. */
export const BOOKING_STATUS = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Hoàn tất',
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

/** Statuses a customer may still cancel from. */
export const CANCELLABLE_BOOKING_STATUSES: readonly string[] = [BOOKING_STATUS.PENDING_PAYMENT, BOOKING_STATUS.CONFIRMED];

/** Reviews are only accepted once the stay is "Hoàn tất" (backend RB9), never for a merely confirmed booking. */
export const canReviewBooking = (status: string): boolean => status === BOOKING_STATUS.COMPLETED;

export type BookingTab = 'all' | BookingStatus;

export const BOOKING_TABS: ReadonlyArray<{ key: BookingTab; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: BOOKING_STATUS.PENDING_PAYMENT, label: BOOKING_STATUS.PENDING_PAYMENT },
  { key: BOOKING_STATUS.CONFIRMED, label: BOOKING_STATUS.CONFIRMED },
  { key: BOOKING_STATUS.COMPLETED, label: BOOKING_STATUS.COMPLETED },
  { key: BOOKING_STATUS.CANCELLED, label: BOOKING_STATUS.CANCELLED },
];

/** The status tab a known booking status belongs to; null for open-domain/unknown values (they only show under "Tất cả"). */
export const getBookingTab = (status: string): BookingStatus | null =>
  (Object.values(BOOKING_STATUS) as string[]).includes(status) ? (status as BookingStatus) : null;

export const matchesBookingTab = (status: string, tab: BookingTab): boolean => tab === 'all' || getBookingTab(status) === tab;
