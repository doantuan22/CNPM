import { Link } from 'react-router-dom';
import { ShieldAlert, Star, LifeBuoy, BarChart3, Tag } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản trị hệ thống (Admin)</h1>
        <p className="text-sm text-slate-500">Giám sát nền tảng, quản lý khuyến mãi và thống kê hệ thống</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          to="/admin/analytics"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Báo cáo & thống kê</h2>
            <p className="text-xs text-slate-500">Tài khoản, khách sạn, doanh thu, hoàn tiền, đánh giá</p>
          </div>
        </Link>

        <Link
          to="/admin/promotions"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Quản lý khuyến mãi</h2>
            <p className="text-xs text-slate-500">Tạo, cập nhật, bật/tắt mã khuyến mãi toàn hệ thống</p>
          </div>
        </Link>

        <Link
          to="/admin/reviews"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Kiểm duyệt đánh giá</h2>
            <p className="text-xs text-slate-500">Duyệt, ẩn hoặc đánh dấu vi phạm</p>
          </div>
        </Link>

        <Link
          to="/admin/support"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Hỗ trợ & khiếu nại</h2>
            <p className="text-xs text-slate-500">Tiếp nhận và xử lý yêu cầu khách hàng</p>
          </div>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">Trung tâm kiểm soát quản trị viên</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Mô-đun phê duyệt khách sạn/đối tác đang trong giai đoạn chuẩn bị nền tảng (TECH-0). Chức năng chi tiết sẽ được phát triển theo lộ trình dự án.
        </p>
      </div>
    </div>
  );
}
