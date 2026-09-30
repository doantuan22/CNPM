import { Link, useSearchParams } from 'react-router-dom';
import { usePaymentStatus } from '../features/payments/hooks';
import { formatCurrencyVND } from '../lib/utils';
import { CustomerCenterNavigation } from '../components/layouts/CustomerCenterNavigation';
import { resolvePaymentResult, type PaymentResult } from '../features/payments/result';
import { ApiError } from '../services/apiClient';

const resultCardClass = 'bg-white rounded-3xl border border-border p-8 md:p-12 shadow-md w-full max-w-2xl text-center';

function refundMessage(result: Extract<PaymentResult, { kind: 'cancelled-paid' }>, confirmationCode: string): string {
  switch (result.refund) {
    case 'refunded':
      return result.refunded >= result.paid
        ? `Khoản thanh toán ${formatCurrencyVND(result.paid)} đã được hoàn lại đầy đủ.`
        : `Đã hoàn ${formatCurrencyVND(result.refunded)} trong số ${formatCurrencyVND(result.paid)} đã thanh toán.`;
    case 'pending':
      return 'Yêu cầu hoàn tiền đang được xử lý. Vui lòng theo dõi trạng thái hoàn tiền trong chi tiết đơn.';
    case 'failed':
      return 'Hoàn tiền chưa thành công. Bạn có thể thử lại trong chi tiết đơn hoặc liên hệ hỗ trợ.';
    default:
      return `Chúng tôi chưa ghi nhận yêu cầu hoàn tiền cho khoản thanh toán này. Vui lòng liên hệ hỗ trợ kèm mã đơn ${confirmationCode}.`;
  }
}

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const bookingId = Number(searchParams.get('bookingId'));
  const hintStatus = searchParams.get('status');

  const hasBookingId = Number.isFinite(bookingId) && bookingId > 0;
  const statusQuery = usePaymentStatus(bookingId, { enabled: hasBookingId });
  const booking = statusQuery.data;
  const latestPayment = booking?.ThanhToan[0];
  const result = booking ? resolvePaymentResult(booking) : null;
  const isConfirmed = result?.kind === 'confirmed';
  const isFailed = result?.kind === 'failed';

  return (
    <div className="bg-surface-secondary text-ink min-h-screen flex flex-col font-sans antialiased !max-w-full !px-0 !py-0">
      <div className="max-w-[800px] w-full mx-auto px-4 pt-8"><CustomerCenterNavigation /></div>
      <main className="max-w-[800px] w-full mx-auto px-4 py-12 md:py-16 flex-grow flex flex-col items-center justify-center">

        {!hasBookingId ? (
          // The gateway redirect carried no booking (unknown callback / invalid signature): nothing to look up, and no outcome to claim.
          <div className={resultCardClass}>
            <h1 className="text-2xl font-bold text-heading mb-2">Chưa xác định được kết quả thanh toán</h1>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Chúng tôi không nhận được thông tin đơn đặt phòng từ cổng thanh toán nên chưa thể xác nhận giao dịch. Nếu tài khoản của bạn đã bị trừ tiền, hãy kiểm tra trong "Đặt phòng của tôi" hoặc gửi yêu cầu hỗ trợ kèm thời điểm thanh toán.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/bookings" className="btn btn-primary sm:flex-1 py-3 text-base">Xem đặt phòng của tôi</Link>
              <Link to="/support" className="btn btn-secondary sm:flex-1 py-3 text-base">Liên hệ hỗ trợ</Link>
            </div>
          </div>
        ) : statusQuery.isLoading ? (
          <div className="flex justify-center py-16" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span className="sr-only">Đang tải...</span></div>
        ) : statusQuery.isError && !booking ? (
          <div className={resultCardClass}>
            <h1 className="text-2xl font-bold text-heading mb-2">Không thể tải kết quả thanh toán</h1>
            <p role="alert" className="text-sm text-muted leading-relaxed mb-6">
              {statusQuery.error instanceof ApiError ? statusQuery.error.message : 'Đã có lỗi khi lấy trạng thái đơn đặt phòng. Vui lòng thử lại.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button type="button" className="btn btn-primary sm:flex-1 py-3 text-base" onClick={() => statusQuery.refetch()}>Thử lại</button>
              <Link to={`/bookings/${bookingId}`} className="btn btn-secondary sm:flex-1 py-3 text-base">Xem đơn đặt phòng</Link>
            </div>
          </div>
        ) : result?.kind === 'cancelled-paid' && booking ? (
          <div className={resultCardClass}>
            <h1 className="text-2xl font-bold text-heading mb-2">Đơn đặt phòng không được xác nhận</h1>
            <p className="text-sm text-muted leading-relaxed mb-3">
              Đơn đã hết hạn hoặc đã bị hủy trước khi thanh toán hoàn tất, nên không được xác nhận.
            </p>
            <p className="text-sm font-semibold text-heading leading-relaxed mb-6">{refundMessage(result, booking.MaXacNhanDatPhong)}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={`/bookings/${bookingId}`} className="btn btn-primary sm:flex-1 py-3 text-base">Xem chi tiết đơn</Link>
              <Link to="/support" className="btn btn-secondary sm:flex-1 py-3 text-base">Liên hệ hỗ trợ</Link>
            </div>
          </div>
        ) : isConfirmed ? (
          <div className="bg-white rounded-3xl border border-border p-8 md:p-12 shadow-md w-full max-w-2xl text-center">
            <h1 className="text-2xl font-bold text-heading mb-2">Thanh toán thành công!</h1>
            <p className="text-sm text-muted mb-4">Cảm ơn bạn đã lựa chọn Egode. Đặt phòng của bạn đã được xác nhận.</p>
            {booking && (
              <div className="inline-block text-xl font-bold text-primary bg-blue-50 px-5 py-2 rounded-xl border border-dashed border-primary/40 mb-8">
                {booking.MaDatPhong}
              </div>
            )}

            {booking && (
              <div className="card text-left mb-8 shadow-sm border border-border">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-5 pb-4 border-b border-border">
                    <h3 className="text-base font-semibold text-heading">Tổng quan giao dịch</h3>
                    <span className="status-badge status-confirmed">Thành công</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-muted">Số tiền thanh toán</span>
                    <span className="text-xl font-bold text-primary">{formatCurrencyVND(latestPayment?.SoTien || 0)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {Number.isFinite(bookingId) && bookingId > 0 && (
                <Link to={`/bookings/${bookingId}`} className="btn btn-primary sm:flex-1 py-3 text-base">Xem đơn đặt phòng</Link>
              )}
              <Link to="/" className="btn btn-secondary sm:flex-1 py-3 text-base">Về trang chủ</Link>
            </div>
          </div>
        ) : isFailed ? (
          <div className="bg-white rounded-3xl border border-border p-8 md:p-12 shadow-md w-full max-w-2xl text-center">
            <h1 className="text-2xl font-bold text-heading mb-2">Thanh toán không thành công</h1>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Giao dịch qua thanh toán trực tuyến không thành công. Vui lòng kiểm tra lại số dư tài khoản hoặc thử lại phương thức thanh toán khác.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               {Number.isFinite(bookingId) && bookingId > 0 && (
                 <Link to={`/bookings/${bookingId}`} className="btn btn-danger sm:flex-1 py-3 text-base">Về chi tiết đơn</Link>
               )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-border p-8 md:p-12 shadow-md w-full max-w-2xl text-center">
            <h1 className="text-2xl font-bold text-heading mb-2">Đang xử lý kết quả...</h1>
            <p className="text-sm text-muted leading-relaxed mb-6">
              {hintStatus === 'success'
                ? 'VNPAY báo thành công, đang chờ xác nhận cuối cùng từ hệ thống.'
                : 'Vui lòng kiểm tra lại trạng thái đặt phòng trong ít phút.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               {Number.isFinite(bookingId) && bookingId > 0 && (
                 <Link to={`/bookings/${bookingId}`} className="btn btn-primary sm:flex-1 py-3 text-base">Xem đơn đặt phòng</Link>
               )}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
