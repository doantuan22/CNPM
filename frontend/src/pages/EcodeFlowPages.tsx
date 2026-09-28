import { FormEvent, type ReactNode, useState } from 'react';
import { CreditCard, FileText, Hotel, LockKeyhole, PenLine, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Textarea } from '../components/common/Textarea';
import { EmptyState, ErrorState, LoadingState } from '../components/common/QueryState';
import { BookingSummary } from '../components/domain/BookingSummary';
import { useBookingDetail } from '../features/bookings/hooks';
import { useCreateVnpayPayment } from '../features/payments/hooks';
import { useCreateReview, useMyReview } from '../features/reviews/hooks';
import { useMyHotels } from '../features/owner/hooks';
import type { OwnerHotel } from '../features/owner/types';
import { ApiError } from '../services/apiClient';

function Frame({ title, description, icon: Icon, children }: { title: string; description: string; icon: typeof Hotel; children: ReactNode }) {
  return (
    <div className="operation-page space-y-6">
      <header className="operation-page__heading">
        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        <div><h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1><p className="mt-1 text-sm text-slate-600">{description}</p></div>
      </header>
      {children}
    </div>
  );
}

function HotelSelectionList({ hotels, href, action, context }: {
  hotels: OwnerHotel[];
  href: (hotelId: number) => string;
  action: string;
  context: string;
}) {
  return (
    <ul className="owner-hotel-select-list">
      {hotels.map((hotel) => (
        <li key={hotel.MaKhachSan}>
          <Link to={href(hotel.MaKhachSan)}>
            {hotel.HINH_ANH_KHACH_SAN[0]?.URL ? (
              <img src={hotel.HINH_ANH_KHACH_SAN[0].URL} alt="" />
            ) : (
              <span className="owner-hotel-select-list__placeholder" aria-hidden="true"><Hotel className="h-5 w-5" /></span>
            )}
            <span className="owner-hotel-select-list__identity">
              <strong>{hotel.TenKhachSan}</strong>
              <small>{hotel.DIA_PHUONG.TenThanhPho} · {hotel._count?.LOAI_PHONG ?? 0} loại phòng</small>
            </span>
            <span className="owner-hotel-select-list__status">{hotel.TrangThai}</span>
            <span className="owner-hotel-select-list__action">{action}<i className="ph ph-arrow-right" aria-hidden="true"></i></span>
          </Link>
        </li>
      ))}
      {hotels.length > 0 && <li className="owner-hotel-select-list__context">{context}</li>}
    </ul>
  );
}

function LoadingOrError({ loading, error, empty = false }: { loading: boolean; error?: unknown; empty?: boolean }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error instanceof ApiError ? error.message : 'Không thể tải dữ liệu từ hệ thống'} />;
  if (empty) return <EmptyState title="Chưa có dữ liệu từ hệ thống" />;
  return null;
}

function useBookingFromParams() {
  const { id, bookingId } = useParams<{ id?: string; bookingId?: string }>();
  const value = Number(bookingId ?? id);
  return useBookingDetail(Number.isFinite(value) ? value : 0);
}

export function BookingRoomPage() {
  const booking = useBookingFromParams();
  return <Frame title="Thông tin phòng" description="Kiểm tra phòng và thông tin lưu trú trước khi xác nhận." icon={Hotel}>
    <LoadingOrError loading={booking.isLoading} error={booking.error} empty={!booking.data} />
    {booking.data && <div className="booking-flow-layout">
      <BookingSummary booking={booking.data} />
      <aside className="booking-flow-layout__action"><p className="text-sm text-muted">Kiểm tra khách sạn, ngày ở và các phòng đã chọn.</p><Button asChild className="mt-5 w-full"><Link to={`/booking/${booking.data.MaDatPhong}/confirm`}>Tiếp tục</Link></Button></aside>
    </div>}
  </Frame>;
}

export function BookingConfirmPage() {
  const booking = useBookingFromParams();
  return <Frame title="Xác nhận đặt phòng" description="Xác nhận thông tin đặt phòng trước khi thanh toán." icon={ShieldCheck}>
    <LoadingOrError loading={booking.isLoading} error={booking.error} empty={!booking.data} />
    {booking.data && <div className="booking-flow-layout"><BookingSummary booking={booking.data} /><aside className="booking-flow-layout__action"><p className="text-sm text-muted">Thông tin lưu trú và chính sách hủy của đặt phòng.</p><Button variant="outline" asChild className="mt-5 w-full"><Link to={`/booking/${booking.data.MaDatPhong}/room`}>Quay lại thông tin</Link></Button><Button asChild className="mt-2 w-full"><Link to={`/booking/${booking.data.MaDatPhong}/payment`}>Đến thanh toán</Link></Button></aside></div>}
  </Frame>;
}

export function PaymentPage() {
  const booking = useBookingFromParams();
  const payment = useCreateVnpayPayment(booking.data?.MaDatPhong ?? 0);
  const start = () => payment.mutate(undefined, { onSuccess: (result) => { window.location.href = result.paymentUrl; } });
  return <Frame title="Thanh toán" description="Thanh toán an toàn qua cổng được hệ thống hỗ trợ." icon={CreditCard}>
    <LoadingOrError loading={booking.isLoading} error={booking.error} empty={!booking.data} />
    {booking.data && <div className="booking-flow-layout"><BookingSummary booking={booking.data} /><aside className="booking-flow-layout__action"><div className="flex items-start gap-3 border-b border-border pb-4"><LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><p className="text-sm text-secondary">Bạn sẽ được chuyển đến cổng VNPAY để hoàn tất giao dịch.</p></div>{payment.isError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{payment.error instanceof ApiError ? payment.error.message : 'Không thể khởi tạo thanh toán'}</p>}<Button className="mt-5 w-full" onClick={start} disabled={payment.isPending}>{payment.isPending ? 'Đang chuyển đến cổng thanh toán...' : 'Thanh toán qua VNPAY'}</Button></aside></div>}
  </Frame>;
}

export function WriteReviewPage() {
  const { id } = useParams<{ id: string }>();
  const bookingId = Number(id);
  const existing = useMyReview(bookingId);
  const create = useCreateReview(bookingId);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const submit = (event: FormEvent) => { event.preventDefault(); create.mutate({ diemDanhGia: rating, noiDung: content.trim() }); };
  return <Frame title="Viết đánh giá" description="Chia sẻ trải nghiệm thực tế của bạn sau kỳ lưu trú." icon={PenLine}>
    <LoadingOrError loading={existing.isLoading} error={existing.error} />
    {existing.data ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800">Bạn đã gửi đánh giá cho đặt phòng này.</div> : <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"><div><label htmlFor="ecode-flow-pages-field-1" className="mb-2 block text-sm font-medium text-slate-700">Điểm đánh giá</label><select id="ecode-flow-pages-field-1" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full rounded-lg border border-slate-300 px-3 py-2">{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value}/5</option>)}</select></div><Textarea label="Nội dung đánh giá" required rows={5} value={content} onChange={(e) => setContent(e.target.value)} /><Button type="submit" disabled={create.isPending}>{create.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}</Button></form>}
  </Frame>;
}

export function PartnerInventoryPage({ mode = 'inventory' }: { mode?: 'rooms' | 'inventory' }) {
  const hotels = useMyHotels();
  const isRoomTypes = mode === 'rooms';
  return <Frame title={isRoomTypes ? 'Loại phòng' : 'Quỹ phòng & giá bán'} description={isRoomTypes ? 'Chọn khách sạn để xem và quản lý các loại phòng.' : 'Chọn khách sạn để quản lý số phòng mở bán và giá theo ngày.'} icon={Hotel}>
    <LoadingOrError loading={hotels.isLoading} error={hotels.error} empty={!hotels.data?.length} />
    {hotels.data && hotels.data.length > 0 && <HotelSelectionList hotels={hotels.data} href={(id) => `/owner/hotels/${id}`} action="Chọn khách sạn" context={isRoomTypes ? 'Sau khi mở hồ sơ, chọn loại phòng để cập nhật thông tin.' : 'Mức giá và số lượng được áp dụng theo từng ngày trong màn quản lý loại phòng.'} />}
  </Frame>;
}

export function PartnerBookingsPage() {
  const hotels = useMyHotels();
  return <Frame title="Đặt phòng của đối tác" description="Theo dõi các đặt phòng phát sinh tại khách sạn của bạn." icon={FileText}>
    <LoadingOrError loading={hotels.isLoading} error={hotels.error} empty={!hotels.data?.length} />
    {hotels.data && hotels.data.length > 0 && <HotelSelectionList hotels={hotels.data} href={(id) => `/owner/hotels/${id}/bookings`} action="Mở danh sách đặt phòng" context="Danh sách và bộ lọc sẽ áp dụng cho khách sạn đã chọn." />}
  </Frame>;
}

function HotelAnalyticsLinks({ mode }: { mode: 'report' | 'revenue' }) {
  const hotels = useMyHotels();
  return <><LoadingOrError loading={hotels.isLoading} error={hotels.error} empty={!hotels.data?.length} />{hotels.data && hotels.data.length > 0 && <HotelSelectionList hotels={hotels.data} href={(id) => `/owner/hotels/${id}/analytics`} action={mode === 'report' ? 'Mở báo cáo' : 'Mở doanh thu'} context="Báo cáo hiển thị dữ liệu thực tế theo khách sạn đã chọn." />}</>;
}

export function PartnerReportsPage() { return <Frame title="Báo cáo đối tác" description="Theo dõi hiệu suất kinh doanh và đặt phòng." icon={FileText}><HotelAnalyticsLinks mode="report" /></Frame>; }

export function PartnerRevenuePage() { return <Frame title="Doanh thu" description="Tổng hợp doanh thu theo dữ liệu giao dịch thực tế." icon={CreditCard}><HotelAnalyticsLinks mode="revenue" /></Frame>; }
