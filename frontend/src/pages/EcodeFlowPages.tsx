import { FormEvent, type ReactNode, useState } from 'react';
import { CheckCircle2, CreditCard, FileText, Hotel, LockKeyhole, PenLine, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Textarea } from '../components/common/Textarea';
import { useBookingDetail } from '../features/bookings/hooks';
import { useCreateVnpayPayment } from '../features/payments/hooks';
import { useCreateReview, useMyReview } from '../features/reviews/hooks';
import { useMyHotels } from '../features/owner/hooks';
import { ApiError } from '../services/apiClient';
import { formatCurrencyVND } from '../lib/utils';

function Frame({ title, description, icon: Icon, children }: { title: string; description: string; icon: typeof Hotel; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <header className="egode-home-hero rounded-2xl bg-white p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon className="h-6 w-6" /></span>
          <div><h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1><p className="mt-1 text-sm text-slate-500">{description}</p></div>
        </div>
      </header>
      {children}
    </div>
  );
}

function LoadingOrError({ loading, error, empty = false }: { loading: boolean; error?: unknown; empty?: boolean }) {
  if (loading) return <div className="flex justify-center rounded-2xl border border-slate-200 bg-white py-16" role="status"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" /></div>;
  if (error) return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error instanceof ApiError ? error.message : 'Không thể tải dữ liệu từ hệ thống'}</div>;
  if (empty) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">Chưa có dữ liệu từ hệ thống.</div>;
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
    {booking.data && <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-700"><CheckCircle2 className="h-4 w-4" /> Bước 1 / 3</div>
        <h2 className="text-lg font-semibold text-slate-900">{booking.data.TenKhachSan}</h2>
        <p className="text-sm text-slate-500">{booking.data.NgayNhanPhong} → {booking.data.NgayTraPhong}</p>
        {booking.data.ChiTietPhong.map((room) => <div key={room.MaLoaiPhong} className="flex items-center justify-between rounded-xl border border-slate-200 p-4"><span className="font-medium text-slate-800">{room.TenLoaiPhong} × {room.SoLuong}</span><span className="text-sm text-slate-500">Phòng đã chọn</span></div>)}
      </section>
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"><p className="text-sm text-slate-500">Tổng thanh toán</p><p className="mt-2 text-2xl font-bold text-blue-700">{formatCurrencyVND(booking.data.TongTienThanhToan)}</p><Button asChild className="mt-6 w-full"><Link to={`/booking/${booking.data.MaDatPhong}/confirm`}>Tiếp tục</Link></Button></aside>
    </div>}
  </Frame>;
}

export function BookingConfirmPage() {
  const booking = useBookingFromParams();
  return <Frame title="Xác nhận đặt phòng" description="Xác nhận thông tin đặt phòng trước khi thanh toán." icon={ShieldCheck}>
    <LoadingOrError loading={booking.isLoading} error={booking.error} empty={!booking.data} />
    {booking.data && <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"><div className="grid gap-4 sm:grid-cols-2"><div><p className="text-xs text-slate-500">Mã xác nhận</p><p className="font-mono font-semibold text-slate-900">{booking.data.MaXacNhanDatPhong}</p></div><div><p className="text-xs text-slate-500">Trạng thái</p><p className="font-semibold text-slate-900">{booking.data.TrangThai}</p></div><div><p className="text-xs text-slate-500">Nhận phòng</p><p className="font-medium text-slate-800">{booking.data.NgayNhanPhong}</p></div><div><p className="text-xs text-slate-500">Trả phòng</p><p className="font-medium text-slate-800">{booking.data.NgayTraPhong}</p></div></div><div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"><Button variant="outline" asChild><Link to={`/booking/${booking.data.MaDatPhong}/room`}>Quay lại</Link></Button><Button asChild><Link to={`/booking/${booking.data.MaDatPhong}/payment`}>Đến thanh toán</Link></Button></div></section>}
  </Frame>;
}

export function PaymentPage() {
  const booking = useBookingFromParams();
  const payment = useCreateVnpayPayment(booking.data?.MaDatPhong ?? 0);
  const start = () => payment.mutate(undefined, { onSuccess: (result) => { window.location.href = result.paymentUrl; } });
  return <Frame title="Thanh toán" description="Thanh toán an toàn qua cổng được hệ thống hỗ trợ." icon={CreditCard}>
    <LoadingOrError loading={booking.isLoading} error={booking.error} empty={!booking.data} />
    {booking.data && <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"><div className="flex items-center gap-3 rounded-xl bg-blue-50 p-4"><LockKeyhole className="h-5 w-5 text-blue-600" /><p className="text-sm text-blue-800">Thông tin thanh toán được bảo vệ.</p></div><div className="mt-6 flex items-center justify-between"><span className="text-sm text-slate-500">Tổng thanh toán</span><strong className="text-2xl text-blue-700">{formatCurrencyVND(booking.data.TongTienThanhToan)}</strong></div>{payment.isError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{payment.error instanceof ApiError ? payment.error.message : 'Không thể khởi tạo thanh toán'}</p>}<Button className="mt-6 w-full" onClick={start} disabled={payment.isPending}>{payment.isPending ? 'Đang chuyển đến cổng thanh toán...' : 'Thanh toán qua VNPAY'}</Button></section>}
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
    {hotels.data && hotels.data.length > 0 && <div className="grid gap-4 sm:grid-cols-2">{hotels.data.map((hotel) => <Link key={hotel.MaKhachSan} to={`/owner/hotels/${hotel.MaKhachSan}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300"><p className="font-semibold text-slate-900">{hotel.TenKhachSan}</p><p className="mt-1 text-sm text-slate-500">{hotel._count?.LOAI_PHONG ?? 0} loại phòng · {isRoomTypes ? 'mở trang quản lý loại phòng' : 'mở trang quản lý giá & tồn kho'}</p></Link>)}</div>}
  </Frame>;
}

export function PartnerBookingsPage() {
  const hotels = useMyHotels();
  return <Frame title="Đặt phòng của đối tác" description="Theo dõi các đặt phòng phát sinh tại khách sạn của bạn." icon={FileText}>
    <LoadingOrError loading={hotels.isLoading} error={hotels.error} empty={!hotels.data?.length} />
    {hotels.data && hotels.data.length > 0 && <div className="grid gap-4 sm:grid-cols-2">{hotels.data.map((hotel) => <Link key={hotel.MaKhachSan} to={`/owner/hotels/${hotel.MaKhachSan}/bookings`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300"><p className="font-semibold text-slate-900">{hotel.TenKhachSan}</p><p className="mt-1 text-sm text-slate-500">Mở danh sách đặt phòng</p></Link>)}</div>}
  </Frame>;
}

function HotelAnalyticsLinks({ mode }: { mode: 'report' | 'revenue' }) {
  const hotels = useMyHotels();
  return <><LoadingOrError loading={hotels.isLoading} error={hotels.error} empty={!hotels.data?.length} />{hotels.data && hotels.data.length > 0 && <div className="grid gap-4 sm:grid-cols-2">{hotels.data.map((hotel) => <Link key={hotel.MaKhachSan} to={`/owner/hotels/${hotel.MaKhachSan}/analytics`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300"><p className="font-semibold text-slate-900">{hotel.TenKhachSan}</p><p className="mt-1 text-sm text-slate-500">Mở {mode === 'report' ? 'báo cáo thống kê' : 'báo cáo doanh thu'} từ dữ liệu thực tế</p></Link>)}</div>}</>;
}

export function PartnerReportsPage() { return <Frame title="Báo cáo đối tác" description="Theo dõi hiệu suất kinh doanh và đặt phòng." icon={FileText}><HotelAnalyticsLinks mode="report" /></Frame>; }

export function PartnerRevenuePage() { return <Frame title="Doanh thu" description="Tổng hợp doanh thu theo dữ liệu giao dịch thực tế." icon={CreditCard}><HotelAnalyticsLinks mode="revenue" /></Frame>; }
