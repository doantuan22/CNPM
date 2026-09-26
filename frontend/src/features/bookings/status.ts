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
