import { BOOKING_STATUS } from '../bookings/status';
import type { PaymentStatusResponse } from './types';

/** THANH_TOAN / HOAN_TIEN TrangThai — mirrors backend/src/common/constants/payment.ts. */
export const PAYMENT_STATUS = { PENDING: 'Chờ xử lý', SUCCESS: 'Thành công', FAILED: 'Thất bại' } as const;
export const REFUND_STATUS = { PENDING: 'Chờ xử lý', SUCCESS: 'Thành công', FAILED: 'Thất bại' } as const;

export type RefundOutcome = 'refunded' | 'pending' | 'failed' | 'none';

export type PaymentResult =
  | { kind: 'confirmed' }
  /** The booking was cancelled/expired although the gateway captured a payment (the backend then refunds it automatically). */
  | { kind: 'cancelled-paid'; paid: number; refunded: number; refund: RefundOutcome }
  | { kind: 'failed' }
  | { kind: 'processing' };

/** Decides what the payment result page should tell the customer, from the booking's payment-status response. */
export function resolvePaymentResult(status: PaymentStatusResponse): PaymentResult {
  if (status.TrangThaiDatPhong === BOOKING_STATUS.CONFIRMED) return { kind: 'confirmed' };

  const succeeded = status.ThanhToan.filter((payment) => payment.TrangThai === PAYMENT_STATUS.SUCCESS);
  if (status.TrangThaiDatPhong === BOOKING_STATUS.CANCELLED && succeeded.length > 0) {
    const paid = succeeded.reduce((sum, payment) => sum + payment.SoTien, 0);
    const refunds = succeeded.flatMap((payment) => payment.HoanTien);
    const refunded = refunds.filter((refund) => refund.TrangThai === REFUND_STATUS.SUCCESS).reduce((sum, refund) => sum + refund.SoTienHoan, 0);

    let refund: RefundOutcome = 'none';
    if (refunded >= paid) refund = 'refunded';
    else if (refunds.some((item) => item.TrangThai === REFUND_STATUS.FAILED)) refund = 'failed';
    else if (refunds.some((item) => item.TrangThai === REFUND_STATUS.PENDING)) refund = 'pending';
    else if (refunded > 0) refund = 'refunded';
    return { kind: 'cancelled-paid', paid, refunded, refund };
  }

  if (status.ThanhToan[0]?.TrangThai === PAYMENT_STATUS.FAILED) return { kind: 'failed' };
  return { kind: 'processing' };
}
