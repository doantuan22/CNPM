import { useState } from 'react';
import { ArrowLeft, ShieldCheck, CreditCard, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useBookingDetail, useCancelBooking } from '../features/bookings/hooks';
import { bookingStatusBadgeClass, paymentStatusBadgeClass } from '../features/bookings/status';
import { hoursBeforeCheckIn, selectRefundPercentPreview, computeRefundAmountPreview } from '../features/bookings/refund-preview';
import { useCreateVnpayPayment, useRetryRefund } from '../features/payments/hooks';
import { ReviewSection } from '../components/reviews/ReviewSection';
import { formatCurrencyVND, cn } from '../lib/utils';
import { ApiError } from '../services/apiClient';

const CANCELLABLE = ['Chờ thanh toán', 'Đã xác nhận'];

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bookingId = Number(id);
  const location = useLocation();
  const justBooked = Boolean((location.state as { justBooked?: boolean } | null)?.justBooked);

  const bookingQuery = useBookingDetail(bookingId);
  const payMutation = useCreateVnpayPayment(bookingId);
  const cancelMutation = useCancelBooking(bookingId);
  const retryRefundMutation = useRetryRefund(bookingId);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelNote, setCancelNote] = useState('');

  if (bookingQuery.isLoading) {
    return (
      <div className="flex justify-center py-16" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (bookingQuery.isError || !bookingQuery.data) {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
        {bookingQuery.error instanceof ApiError ? bookingQuery.error.message : 'Không tìm thấy đặt phòng'}
      </div>
    );
  }

  const booking = bookingQuery.data;
  const canCancel = CANCELLABLE.includes(booking.TrangThai);
  const successfulPaid = booking.ThanhToan.filter((p) => p.TrangThai === 'Thành công').reduce((sum, p) => sum + p.SoTien, 0);
  const previewHours = hoursBeforeCheckIn(booking.NgayNhanPhong);
  const previewPercent = selectRefundPercentPreview(booking.ChinhSachHuy.ChiTiet, previewHours);
  const previewAmount = computeRefundAmountPreview(successfulPaid, previewPercent);

  const startPayment = () => {
    payMutation.mutate(undefined, {
      onSuccess: (result) => {
        window.location.href = result.paymentUrl;
      },
    });
  };

  const confirmCancel = () => {
    cancelMutation.mutate({ ghiChu: cancelNote.trim() || undefined }, { onSuccess: () => setShowCancelConfirm(false) });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/bookings">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay lại danh sách đặt phòng
        </Link>
      </Button>

      {justBooked && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Đặt phòng thành công!</h1>
          <p className="mt-1 text-sm text-slate-600">Vui lòng thanh toán để hoàn tất đặt phòng.</p>
        </div>
      )}

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Mã xác nhận: <span className="font-mono font-semibold text-slate-900">{booking.MaXacNhanDatPhong}</span>
            </p>
            <p className="text-xs text-slate-500">{booking.NgayNhanPhong} → {booking.NgayTraPhong}</p>
          </div>
          <span className={cn('rounded-full px-3 py-1 text-sm font-medium', bookingStatusBadgeClass(booking.TrangThai))}>
            {booking.TrangThai}
          </span>
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-4">
          {booking.ChiTietPhong.map((line) => (
            <div key={line.MaLoaiPhong} className="flex justify-between text-sm text-slate-700">
              <span>{line.TenLoaiPhong} × {line.SoLuong}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Tổng tiền phòng</span>
            <span>{formatCurrencyVND(booking.TongTienPhong)}</span>
          </div>
          {booking.SoTienGiam > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Giảm giá{booking.KhuyenMai ? ` (${booking.KhuyenMai.MaCode})` : ''}</span>
              <span>−{formatCurrencyVND(booking.SoTienGiam)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-slate-900">
            <span>Tổng thanh toán</span>
            <span>{formatCurrencyVND(booking.TongTienThanhToan)}</span>
          </div>
        </div>

        {booking.GhiChu && <p className="border-t border-slate-100 pt-4 text-sm text-slate-600">Ghi chú: {booking.GhiChu}</p>}

        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <p className="mb-1 flex items-center gap-1 font-medium text-slate-800">
            <ShieldCheck className="h-3.5 w-3.5" /> {booking.ChinhSachHuy.TenChinhSach}
          </p>
          <ul className="space-y-0.5">
            {booking.ChinhSachHuy.ChiTiet.map((tier, i) => (
              <li key={i}>Hủy trước {tier.SoGioTruocNhanPhong} giờ: hoàn {tier.TyLeHoanTien}%</li>
            ))}
          </ul>
        </div>

        {booking.TrangThai === 'Chờ thanh toán' && (
          <div className="space-y-2 border-t border-slate-100 pt-4">
            {payMutation.isError && (
              <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {payMutation.error instanceof ApiError ? payMutation.error.message : 'Không thể tạo yêu cầu thanh toán'}
              </div>
            )}
            <Button className="w-full" onClick={startPayment} disabled={payMutation.isPending}>
              <CreditCard className="mr-1.5 h-4 w-4" />
              {payMutation.isPending ? 'Đang chuyển đến VNPAY...' : 'Thanh toán qua VNPAY'}
            </Button>
          </div>
        )}

        {canCancel && (
          <div className="space-y-3 border-t border-slate-100 pt-4">
            {!showCancelConfirm ? (
              <Button variant="danger" className="w-full" onClick={() => setShowCancelConfirm(true)}>
                Hủy đặt phòng
              </Button>
            ) : (
              <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">Xác nhận hủy đặt phòng?</p>
                {successfulPaid > 0 ? (
                  <p className="text-xs text-red-700">
                    Dự kiến hoàn: <strong>{formatCurrencyVND(previewAmount)}</strong> ({previewPercent}% của {formatCurrencyVND(successfulPaid)}
                    đã thanh toán) — số tiền chính xác sẽ do hệ thống tính lại khi xác nhận.
                  </p>
                ) : (
                  <p className="text-xs text-red-700">Đặt phòng này chưa thanh toán — hủy sẽ không tạo yêu cầu hoàn tiền.</p>
                )}
                <div>
                  <label htmlFor="cancel-note" className="mb-1 block text-xs font-medium text-red-800">
                    Lý do hủy (không bắt buộc)
                  </label>
                  <textarea
                    id="cancel-note"
                    rows={2}
                    value={cancelNote}
                    onChange={(e) => setCancelNote(e.target.value)}
                    className="block w-full rounded-lg border border-red-300 px-3 py-2 text-sm"
                  />
                </div>
                {cancelMutation.isError && (
                  <div role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-xs text-red-800">
                    {cancelMutation.error instanceof ApiError ? cancelMutation.error.message : 'Không thể hủy đặt phòng'}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="danger" className="flex-1" onClick={confirmCancel} disabled={cancelMutation.isPending}>
                    {cancelMutation.isPending ? 'Đang hủy...' : 'Xác nhận hủy'}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowCancelConfirm(false)}>
                    Không hủy
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {booking.ThanhToan.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-slate-900">Thanh toán & hoàn tiền</h2>
          {booking.ThanhToan.map((payment) => (
            <div key={payment.MaThanhToan} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900">{formatCurrencyVND(payment.SoTien)} · {payment.PhuongThucThanhToan}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', paymentStatusBadgeClass(payment.TrangThai))}>
                  {payment.TrangThai}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{new Date(payment.ThoiGianGiaoDich).toLocaleString('vi-VN')}</p>

              {payment.HoanTien.map((refund) => (
                <div key={refund.MaHoanTien} className="mt-2 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">Hoàn tiền {formatCurrencyVND(refund.SoTienHoan)}</span>
                      <span className={cn('rounded-full px-2 py-0.5 font-medium', paymentStatusBadgeClass(refund.TrangThai))}>
                        {refund.TrangThai}
                      </span>
                    </div>
                    <p className="mt-0.5 text-slate-500">{refund.LyDoHoanTien}</p>
                  </div>
                  {refund.TrangThai !== 'Thành công' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryRefundMutation.mutate(refund.MaHoanTien)}
                      disabled={retryRefundMutation.isPending}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" /> Thử lại
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <ReviewSection bookingId={booking.MaDatPhong} bookingStatus={booking.TrangThai} />
    </div>
  );
}
