import { CalendarCheck, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Link, useLocation } from 'react-router-dom';
import { formatCurrencyVND } from '../lib/utils';
import type { Booking } from '../features/bookings/types';

interface BookingResultState {
  booking?: Booking;
  hotelName?: string;
}

export default function BookingsPage() {
  const location = useLocation();
  const state = location.state as BookingResultState | null;
  const booking = state?.booking;

  if (booking) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Đặt phòng thành công!</h1>
          <p className="mt-1 text-sm text-slate-600">
            Mã xác nhận: <span className="font-mono font-semibold">{booking.MaXacNhanDatPhong}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Trạng thái: {booking.TrangThai}</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          {state?.hotelName && <h2 className="text-lg font-semibold text-slate-900">{state.hotelName}</h2>}
          <p className="text-sm text-slate-600">
            {booking.NgayNhanPhong} → {booking.NgayTraPhong} ({booking.SoDem} đêm)
          </p>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            {booking.ChiTietPhong.map((line) => (
              <div key={line.MaLoaiPhong} className="flex justify-between text-sm">
                <span>
                  {line.TenLoaiPhong} × {line.SoLuong}
                </span>
                <span>{line.ThanhTien !== null ? formatCurrencyVND(line.ThanhTien) : '—'}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Tổng tiền phòng</span>
              <span>{formatCurrencyVND(booking.TongTienPhong)}</span>
            </div>
            {booking.KhuyenMai && (
              <div className="flex justify-between text-green-700">
                <span>Giảm giá ({booking.KhuyenMai.MaCode})</span>
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
                <li key={i}>
                  Hủy trước {tier.SoGioTruocNhanPhong} giờ: hoàn {tier.TyLeHoanTien}%
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-500">
            Đây là bước xác nhận đặt phòng. Chức năng thanh toán sẽ được hỗ trợ ở phase tiếp theo.
          </p>

          <Button asChild className="w-full">
            <Link to="/hotels">Tiếp tục khám phá khách sạn</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý đặt phòng</h1>
        <p className="text-sm text-slate-500">Xem và theo dõi lịch sử đặt phòng của bạn</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <CalendarCheck className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">Chưa có thông tin đặt phòng</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Bạn chưa thực hiện đơn đặt phòng nào. Hãy khám phá danh sách khách sạn và lên kế hoạch cho chuyến đi tiếp theo!
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link to="/hotels">Tìm kiếm khách sạn</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
