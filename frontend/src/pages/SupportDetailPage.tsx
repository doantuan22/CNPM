import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useMySupportRequest } from '../features/support/hooks';
import { supportStatusBadgeClass } from '../features/support/status';
import { cn } from '../lib/utils';
import { ApiError } from '../services/apiClient';

export default function SupportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const requestQuery = useMySupportRequest(Number(id));

  if (requestQuery.isLoading) {
    return (
      <div className="flex justify-center py-16" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (requestQuery.isError || !requestQuery.data) {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
        {requestQuery.error instanceof ApiError ? requestQuery.error.message : 'Không tìm thấy yêu cầu'}
      </div>
    );
  }

  const r = requestQuery.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/support">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay lại danh sách
        </Link>
      </Button>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{r.TieuDe}</h1>
            <p className="mt-1 text-xs text-slate-500">
              {r.LoaiYeuCau} · Gửi ngày {new Date(r.NgayTao).toLocaleString('vi-VN')}
              {r.DAT_PHONG && <> · Đơn {r.DAT_PHONG.MaXacNhanDatPhong}</>}
            </p>
          </div>
          <span className={cn('rounded-full px-3 py-1 text-sm font-medium', supportStatusBadgeClass(r.TrangThai))}>{r.TrangThai}</span>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="mb-1 text-xs font-medium text-slate-600">Nội dung</p>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{r.NoiDung}</p>
        </div>

        {r.KetQuaXuLy && (
          <div className="rounded-lg bg-green-50 p-3">
            <p className="mb-1 text-xs font-medium text-green-800">Kết quả xử lý{r.NgayXuLy && ` (${new Date(r.NgayXuLy).toLocaleString('vi-VN')})`}</p>
            <p className="whitespace-pre-wrap text-sm text-green-900">{r.KetQuaXuLy}</p>
          </div>
        )}
      </div>
    </div>
  );
}
