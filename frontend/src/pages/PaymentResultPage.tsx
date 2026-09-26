import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { usePaymentStatus } from '../features/payments/hooks';

/**
 * Landing page after the VNPAY-hosted page redirects back
 * (VNPAY_RETURN_URL → backend → here). `status` in the URL is only a hint
 * for the first paint — the actual truth is re-fetched from
 * GET /bookings/:id/payments/status, since the IPN (not this redirect) is
 * the authoritative confirmation and may land slightly after/before this
 * page loads (M6 §1 — "Frontend chỉ hiển thị; backend quyết định trạng thái").
 */
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
    <div className="mx-auto max-w-md space-y-6 text-center">
      {statusQuery.isLoading ? (
        <div className="flex justify-center py-16" role="status" aria-live="polite">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      ) : isConfirmed ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Thanh toán thành công!</h1>
          <p className="mt-1 text-sm text-slate-600">Đặt phòng của bạn đã được xác nhận.</p>
        </div>
      ) : isFailed ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <XCircle className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Thanh toán không thành công</h1>
          <p className="mt-1 text-sm text-slate-600">Đặt phòng chưa được xác nhận. Bạn có thể thử thanh toán lại.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <HelpCircle className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Đang xác nhận thanh toán...</h1>
          <p className="mt-1 text-sm text-slate-600">
            {hintStatus === 'success'
              ? 'VNPAY báo thành công, đang chờ xác nhận cuối cùng từ hệ thống.'
              : 'Vui lòng kiểm tra lại trạng thái đặt phòng trong ít phút.'}
          </p>
        </div>
      )}

      {Number.isFinite(bookingId) && bookingId > 0 && (
        <Button asChild className="w-full">
          <Link to={`/bookings/${bookingId}`}>Xem chi tiết đặt phòng</Link>
        </Button>
      )}
    </div>
  );
}
