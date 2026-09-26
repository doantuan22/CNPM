/**
 * THANH_TOAN.TrangThai — open domain (no CK constraint, same modeling style as
 * BOOKING_STATUS/CANCELLATION_POLICY_STATUS — see hotel-status.ts/commercial.ts).
 */
export const PAYMENT_STATUS = {
  PENDING: 'Chờ xử lý',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

/** THANH_TOAN.PhuongThucThanhToan — open domain. M6 only ever uses VNPAY. */
export const PAYMENT_METHOD = {
  VNPAY: 'VNPAY',
} as const;

/** HOAN_TIEN.TrangThai — open domain (no CK constraint). */
export const REFUND_STATUS = {
  PENDING: 'Chờ xử lý',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
} as const;

export type RefundStatus = (typeof REFUND_STATUS)[keyof typeof REFUND_STATUS];
