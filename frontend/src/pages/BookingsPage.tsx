import { CalendarCheck } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';

export default function BookingsPage() {
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
