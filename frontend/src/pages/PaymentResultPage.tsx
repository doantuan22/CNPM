import { Link, useSearchParams } from 'react-router-dom';
import { usePaymentStatus } from '../features/payments/hooks';
import { formatCurrencyVND } from '../lib/utils';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const bookingId = Number(searchParams.get('bookingId'));
  const hintStatus = searchParams.get('status');

  const statusQuery = usePaymentStatus(bookingId, { enabled: Number.isFinite(bookingId) && bookingId > 0 });
  const booking = statusQuery.data;
  const latestPayment = booking?.ThanhToan[0];
  const isConfirmed = booking?.TrangThaiDatPhong === 'Đã xác nhận';
  const isFailed = latestPayment?.TrangThai === 'Thất bại';

  return (
    <div className="bg-surface-secondary text-ink min-h-screen flex flex-col font-sans antialiased !max-w-full !px-0 !py-0">
      
      <main className="max-w-[800px] w-full mx-auto px-4 py-12 md:py-16 flex-grow flex flex-col items-center justify-center">

        {statusQuery.isLoading ? (
          <div className="flex justify-center py-16" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span className="sr-only">Đang tải...</span></div>
        ) : isConfirmed ? (
          <div className="bg-white rounded-3xl border border-border p-8 md:p-12 shadow-md w-full max-w-2xl text-center">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex justify-center items-center mx-auto mb-5 text-3xl">
              <i className="ph-bold ph-check"></i>
            </div>
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
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex justify-center items-center mx-auto mb-5 text-3xl">
              <i className="ph-bold ph-x"></i>
            </div>
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
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex justify-center items-center mx-auto mb-5 text-3xl">
              <i className="ph-bold ph-question"></i>
            </div>
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
