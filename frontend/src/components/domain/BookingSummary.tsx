import type { BookingDetail } from '../../features/bookings/types';
import { formatCurrencyVND } from '../../lib/utils';
import { PriceDisplay } from './PriceDisplay';
import { StatusBadge } from './StatusBadge';
import { StayContext } from './StayContext';

export function BookingSummary({ booking }: { booking: BookingDetail }) {
  return (
    <section className="booking-context-summary" aria-label="Tóm tắt đặt phòng">
      <header className="booking-context-summary__identity">
        <div><p className="text-xs text-muted">Mã đặt phòng</p><p className="font-mono font-semibold text-primary">{booking.MaXacNhanDatPhong}</p></div>
        <StatusBadge domain="booking" status={booking.TrangThai} />
      </header>
      <div className="booking-context-summary__stay">
        <h2 className="text-lg font-semibold text-heading">{booking.TenKhachSan}</h2>
        <StayContext compact checkIn={booking.NgayNhanPhong} checkOut={booking.NgayTraPhong} />
        <p className="mt-1 text-xs text-muted">{booking.SoDem} đêm</p>
        <ul className="mt-4 divide-y divide-border">
          {booking.ChiTietPhong.map((room) => <li key={room.MaLoaiPhong} className="flex items-center justify-between gap-4 py-3 text-sm"><span className="font-medium text-heading">{room.TenLoaiPhong}</span><span className="shrink-0 text-muted">{room.SoLuong} phòng</span></li>)}
        </ul>
      </div>
      <div className="booking-context-summary__price">
        <div className="flex justify-between gap-4 text-sm text-muted"><span>Tổng tiền phòng</span><span>{formatCurrencyVND(booking.TongTienPhong)}</span></div>
        {booking.SoTienGiam > 0 && <div className="mt-2 flex justify-between gap-4 text-sm text-success"><span>Khuyến mãi</span><span>−{formatCurrencyVND(booking.SoTienGiam)}</span></div>}
        <div className="mt-3 flex justify-between gap-4 border-t border-border pt-3 font-semibold text-heading"><span>Tổng thanh toán</span><PriceDisplay amount={booking.TongTienThanhToan} emphasis="total" /></div>
      </div>
      <section className="booking-context-summary__policy"><h3 className="text-sm font-semibold text-heading">{booking.ChinhSachHuy.TenChinhSach}</h3><p className="mt-1 text-sm text-muted">{booking.ChinhSachHuy.MoTa}</p></section>
    </section>
  );
}
