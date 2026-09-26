import { CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useMyBookings } from '../features/bookings/hooks';
import { bookingStatusBadgeClass } from '../features/bookings/status';
import { formatCurrencyVND, cn } from '../lib/utils';
import { ApiError } from '../services/apiClient';

export default function BookingsPage() {
  const bookingsQuery = useMyBookings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý đặt phòng</h1>
        <p className="text-sm text-slate-500">Xem và theo dõi lịch sử đặt phòng của bạn</p>
      </div>

      {bookingsQuery.isLoading ? (
        <div className="flex justify-center py-16" role="status" aria-live="polite">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      ) : bookingsQuery.isError ? (
        <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {bookingsQuery.error instanceof ApiError ? bookingsQuery.error.message : 'Không thể tải danh sách đặt phòng'}
        </div>
      ) : !bookingsQuery.data || bookingsQuery.data.length === 0 ? (
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
      ) : (
        <div className="space-y-3">
          {bookingsQuery.data.map((b) => (
            <Link
              key={b.MaDatPhong}
              to={`/bookings/${b.MaDatPhong}`}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{b.TenKhachSan}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', bookingStatusBadgeClass(b.TrangThai))}>
                    {b.TrangThai}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Mã: <span className="font-mono">{b.MaXacNhanDatPhong}</span> · {b.NgayNhanPhong} → {b.NgayTraPhong}
                </p>
              </div>
              <div className="text-right text-sm font-semibold text-slate-900">{formatCurrencyVND(b.TongTienThanhToan)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
