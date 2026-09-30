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

/** Badge color per TrangThai — mirrors backend/src/common/constants/hotel-status.ts BOOKING_STATUS (open string domain, matched by value). */
export const bookingStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'Đã xác nhận':
      return 'bg-green-50 text-green-700';
    case 'Chờ thanh toán':
      return 'bg-amber-50 text-amber-700';
    case 'Đã hủy':
      return 'bg-red-50 text-red-700';
    case 'Hoàn tất':
      return 'bg-blue-50 text-blue-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

/** Badge color per THANH_TOAN/HOAN_TIEN TrangThai (payment.ts PAYMENT_STATUS/REFUND_STATUS). */
export const paymentStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'Thành công':
      return 'bg-green-50 text-green-700';
    case 'Chờ xử lý':
      return 'bg-amber-50 text-amber-700';
    case 'Thất bại':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};
