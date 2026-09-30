import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Textarea } from '../components/common/Textarea';
import { useBookingDetail, useCancelBooking } from '../features/bookings/hooks';
import { hoursBeforeCheckIn, selectRefundPercentPreview, computeRefundAmountPreview } from '../features/bookings/refund-preview';
import { useCreateVnpayPayment, useRetryRefund } from '../features/payments/hooks';
import { ReviewSection } from '../components/reviews/ReviewSection';
import { PaymentHoldNotice } from '../components/bookings/PaymentHoldNotice';
import { formatCurrencyVND, cn, formatDateVi, formatDateTimeVi } from '../lib/utils';
import { ApiError } from '../services/apiClient';
import { CustomerCenterNavigation } from '../components/layouts/CustomerCenterNavigation';
import { StatusBadge } from '../components/domain/StatusBadge';
import { BOOKING_STATUS, CANCELLABLE_BOOKING_STATUSES } from '../features/bookings/status';
import { PageSpinner } from '../components/common/PageSpinner';

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

  // Linked from the booking list ("Đánh giá"): the review section only exists after the booking has loaded.
  const bookingLoaded = Boolean(bookingQuery.data);
  useEffect(() => {
    if (bookingLoaded && location.hash === '#danh-gia') document.getElementById('danh-gia')?.scrollIntoView();
  }, [bookingLoaded, location.hash]);

  if (bookingQuery.isLoading) {
    return <PageSpinner />;
  }

  if (bookingQuery.isError || !bookingQuery.data) {
    return (
      <div role="alert" className="mx-auto max-w-md mt-8 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
        {bookingQuery.error instanceof ApiError ? bookingQuery.error.message : 'Không tìm thấy đặt phòng'}
      </div>
    );
  }

  const booking = bookingQuery.data;
  const canCancel = CANCELLABLE_BOOKING_STATUSES.includes(booking.TrangThai);
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
    <div className="page-container flex flex-col gap-6" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      <CustomerCenterNavigation />
      <Link to="/bookings" className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại danh sách đặt phòng</span>
      </Link>

      {booking.TrangThai === BOOKING_STATUS.PENDING_PAYMENT && booking.HanThanhToan && booking.SoGiayConLai !== null && (
        <PaymentHoldNotice
          deadline={booking.HanThanhToan}
          secondsLeft={booking.SoGiayConLai}
          startedAt={bookingQuery.dataUpdatedAt}
          justBooked={justBooked}
          onExpire={() => { void bookingQuery.refetch(); }}
        />
      )}

      <div className="card p-6 flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-ink flex items-center gap-3 flex-wrap">
            Chi tiết đặt phòng <span className="text-primary">#{booking.MaXacNhanDatPhong}</span>
          </h1>
          <p className="text-[13px] text-muted mt-1">Trạng thái hiện tại: {booking.TrangThai}</p>
        </div>
        <StatusBadge domain="booking" status={booking.TrangThai} />
      </div>

      <div className="two-col-layout">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          
          <div className="card card-body">
            <div className="flex gap-5 mb-5 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-ink mb-1">{booking.TenKhachSan}</h2>
                {booking.GhiChu && <p className="text-[13px] text-muted mb-2">Ghi chú: {booking.GhiChu}</p>}
                <Link to={`/hotels/${booking.MaKhachSan}`} className="mt-1.5 inline-flex items-center gap-1 text-[13px] text-primary hover:underline">Xem thông tin khách sạn <i className="ph ph-arrow-right" aria-hidden="true"></i></Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 bg-surface-secondary border border-border rounded-lg p-4 gap-4">
              <div>
                <p className="block text-[12px] text-muted mb-1">Nhận phòng</p>
                <span className="text-[15px] font-semibold text-heading">{formatDateVi(booking.NgayNhanPhong)}</span>
              </div>
              <div>
                <p className="block text-[12px] text-muted mb-1">Trả phòng</p>
                <span className="text-[15px] font-semibold text-heading">{formatDateVi(booking.NgayTraPhong)}</span>
              </div>
            </div>
          </div>

          <div className="card card-body">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-border">
              <span className="text-base font-bold text-heading">Thông tin phòng nghỉ</span>
            </div>

            {booking.ChiTietPhong.map((line, i) => (
              <div key={line.MaLoaiPhong} className={cn("flex justify-between items-center pb-4", i !== booking.ChiTietPhong.length - 1 && "border-b border-dashed border-border mb-4")}>
                <div>
                  <div className="text-[15px] font-semibold text-heading mb-1">{line.TenLoaiPhong}</div>
                  <div className="text-[13px] text-muted">Số lượng: {line.SoLuong} phòng</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card card-body">
            <div className="text-base font-bold text-heading mb-5 pb-3 border-b border-border">Chính sách hủy đặt phòng</div>
            <div className="flex items-center gap-2 mb-4">
              <i className="ph-fill ph-shield-check text-primary text-xl"></i>
              <span className="font-semibold text-ink text-sm">{booking.ChinhSachHuy.TenChinhSach}</span>
            </div>
            <div className="flex flex-col gap-3.5 relative">
              {booking.ChinhSachHuy.ChiTiet.map((tier, i) => (
                <div key={i} className="flex gap-3.5 relative">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 z-10 bg-blue-50 text-primary border border-blue-100">
                    {i + 1}
                  </div>
                  <div>
                    <h5 className="text-[14px] font-semibold text-heading">Trước {tier.SoGioTruocNhanPhong} giờ</h5>
                    <p className="text-[13px] text-muted mt-0.5">Hoàn tiền {tier.TyLeHoanTien}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">
          
          <div className="card card-body">
            <div className="text-base font-bold text-heading mb-5 pb-3 border-b border-border">Chi tiết thanh toán</div>

            <div className="flex justify-between text-[14px] text-muted mb-3">
              <span>Tổng tiền phòng</span>
              <span>{formatCurrencyVND(booking.TongTienPhong)}</span>
            </div>
            {booking.SoTienGiam > 0 && (
              <div className="flex justify-between text-[14px] text-success mb-3">
                <span>Khuyến mãi {booking.KhuyenMai?.MaCode}</span>
                <span>− {formatCurrencyVND(booking.SoTienGiam)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-3.5 mt-3.5 border-t border-border">
              <span className="text-[15px] font-semibold text-heading">Tổng thanh toán</span>
              <span className="text-[20px] font-bold text-primary">{formatCurrencyVND(booking.TongTienThanhToan)}</span>
            </div>

            <div className="mt-4 pt-3.5 border-t border-dashed border-border text-[13px] text-muted flex flex-col gap-1.5">
               {booking.ThanhToan.length === 0 ? (
                 <div>Chưa có giao dịch thanh toán.</div>
               ) : (
                 booking.ThanhToan.map((payment) => (
                   <div key={payment.MaThanhToan} className="bg-slate-50 p-2 rounded border border-slate-100 mt-2">
                     <div>Phương thức: <strong>{payment.PhuongThucThanhToan}</strong></div>
                     <div>Trạng thái: <strong className={payment.TrangThai === 'Thành công' ? 'text-success' : ''}>{payment.TrangThai}</strong></div>
                     <div>Số tiền: <strong>{formatCurrencyVND(payment.SoTien)}</strong></div>
                     <div className="text-[11px] mt-1">{formatDateTimeVi(payment.ThoiGianGiaoDich)}</div>
                     
                     {payment.HoanTien.length > 0 && (
                       <div className="mt-2 pt-2 border-t border-slate-200">
                         {payment.HoanTien.map(r => (
                           <div key={r.MaHoanTien} className="text-amber-700">
                             <strong>Hoàn tiền:</strong> {formatCurrencyVND(r.SoTienHoan)} ({r.TrangThai})
                             {r.TrangThai !== 'Thành công' && (
                               <button 
                                 onClick={() => retryRefundMutation.mutate(r.MaHoanTien)}
                                 className="ml-2 text-[10px] bg-amber-100 px-1.5 py-0.5 rounded text-amber-800 hover:bg-amber-200"
                               >
                                 Thử lại
                               </button>
                             )}
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 ))
               )}
            </div>
          </div>

          {booking.TrangThai === BOOKING_STATUS.PENDING_PAYMENT && (
             <div className="flex flex-col gap-2">
               {payMutation.isError && (
                  <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    {payMutation.error instanceof ApiError ? payMutation.error.message : 'Lỗi tạo TT'}
                  </div>
               )}
               <button type="button" className="btn btn-primary btn-block" onClick={startPayment} disabled={payMutation.isPending}>
                 {payMutation.isPending ? 'Đang xử lý...' : 'Thanh toán ngay'}
               </button>
             </div>
          )}

          {canCancel && (
            <div>
               {!showCancelConfirm ? (
                 <button type="button" className="btn btn-danger-outline btn-block" onClick={() => setShowCancelConfirm(true)}>
                   Hủy đặt phòng này
                 </button>
               ) : (
                 <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                   <h4 className="text-sm font-bold text-red-800 mb-2">Xác nhận hủy đặt phòng?</h4>
                   <div className="bg-white border border-red-100 rounded-lg p-3 mb-3 text-[13px] text-red-700">
                     {successfulPaid > 0 ? (
                       <>
                         <div className="flex justify-between mb-1"><span>Đã thanh toán:</span> <span>{formatCurrencyVND(successfulPaid)}</span></div>
                         <div className="flex justify-between mb-1"><span>Dự kiến hoàn ({previewPercent}%):</span> <strong className="text-base">{formatCurrencyVND(previewAmount)}</strong></div>
                         <div className="text-[11px] mt-2 opacity-80">Hệ thống sẽ tính lại chính xác khi bạn xác nhận.</div>
                       </>
                     ) : (
                       <div>Đơn này chưa thanh toán nên sẽ không có hoàn tiền.</div>
                     )}
                   </div>
                   
                   <div className="mb-4">
                     <label htmlFor="booking-detail-field-1" className="block text-xs text-red-800 font-medium mb-1">Lý do hủy (không bắt buộc)</label>
                     <Textarea id="booking-detail-field-1" 
                       rows={2} 
                       value={cancelNote} 
                       onChange={e => setCancelNote(e.target.value)}
                       className="border-red-300 focus:border-red-500 focus:ring-red-200 text-sm"
                     />
                   </div>

                   {cancelMutation.isError && (
                     <div className="mb-3 text-xs text-red-600 bg-red-100 p-2 rounded">Lỗi: {cancelMutation.error?.message}</div>
                   )}

                   <div className="flex gap-2">
                     <button type="button" className="btn btn-danger flex-1 py-2" onClick={confirmCancel} disabled={cancelMutation.isPending}>
                       {cancelMutation.isPending ? 'Đang xử lý' : 'Xác nhận hủy'}
                     </button>
                     <button type="button" className="btn btn-outline flex-1 py-2" onClick={() => setShowCancelConfirm(false)}>
                       Không hủy
                     </button>
                   </div>
                 </div>
               )}
            </div>
          )}

        </div>

      </div>

      <ReviewSection bookingId={booking.MaDatPhong} bookingStatus={booking.TrangThai} />

    </div>
  );
}
