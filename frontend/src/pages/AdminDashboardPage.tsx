import { ShieldAlert } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản trị hệ thống (Admin)</h1>
        <p className="text-sm text-slate-500">Giám sát nền tảng, phê duyệt khách sạn và thống kê doanh thu</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">Trung tâm kiểm soát quản trị viên</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Mô-đun quản trị hệ thống đang trong giai đoạn chuẩn bị nền tảng (TECH-0). Chức năng chi tiết sẽ được phát triển theo lộ trình dự án.
        </p>
      </div>
    </div>
  );
}
