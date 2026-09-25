import { Building2 } from 'lucide-react';

export default function OwnerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bảng điều khiển chủ khách sạn</h1>
        <p className="text-sm text-slate-500">Quản lý cơ sở lưu trú, danh mục phòng và lịch đặt phòng</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Building2 className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">Khu vực dành cho Đối tác & Chủ khách sạn</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Mô-đun quản lý khách sạn đang trong giai đoạn chuẩn bị nền tảng (TECH-0). Chức năng chi tiết sẽ được phát triển theo lộ trình dự án.
        </p>
      </div>
    </div>
  );
}
