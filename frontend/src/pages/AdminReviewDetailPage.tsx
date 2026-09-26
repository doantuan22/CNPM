import { ArrowLeft, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useAdminReviewDetail, useModerateReview } from '../features/reviews/hooks';
import { reviewStatusBadgeClass } from '../features/reviews/status';
import { cn } from '../lib/utils';
import { ApiError } from '../services/apiClient';

const ACTIONS: Array<{ trangThai: string; label: string; variant: 'primary' | 'outline' | 'danger' }> = [
  { trangThai: 'Hiển thị', label: 'Duyệt (Hiển thị)', variant: 'primary' },
  { trangThai: 'Ẩn', label: 'Ẩn', variant: 'outline' },
  { trangThai: 'Vi phạm', label: 'Đánh dấu vi phạm', variant: 'danger' },
];

export default function AdminReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const reviewId = Number(id);
  const reviewQuery = useAdminReviewDetail(reviewId);
  const moderateMutation = useModerateReview();

  if (reviewQuery.isLoading) {
    return (
      <div className="flex justify-center py-16" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (reviewQuery.isError || !reviewQuery.data) {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
        {reviewQuery.error instanceof ApiError ? reviewQuery.error.message : 'Không tìm thấy đánh giá'}
      </div>
    );
  }

  const r = reviewQuery.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/admin/reviews">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay lại danh sách
        </Link>
      </Button>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{r.KHACH_SAN.TenKhachSan}</h1>
            <p className="mt-1 text-xs text-slate-500">
              {r.TAI_KHOAN.HoTen} ({r.TAI_KHOAN.Email}) · Đơn {r.DAT_PHONG.MaXacNhanDatPhong} · {r.DAT_PHONG.NgayNhanPhong} → {r.DAT_PHONG.NgayTraPhong}
            </p>
          </div>
          <span className={cn('rounded-full px-3 py-1 text-sm font-medium', reviewStatusBadgeClass(r.TrangThai))}>{r.TrangThai}</span>
        </div>

        <div className="flex items-center gap-1 border-t border-slate-100 pt-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={cn('h-5 w-5', i < r.DiemDanhGia ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
          ))}
        </div>

        {r.NoiDung && <p className="whitespace-pre-wrap text-sm text-slate-700">{r.NoiDung}</p>}

        {r.HINH_ANH_DANH_GIA.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {r.HINH_ANH_DANH_GIA.map((img) => (
              <img key={img.MaHinhAnhDanhGia} src={img.URL} alt="" className="h-24 w-24 rounded-lg object-cover" />
            ))}
          </div>
        )}

        {moderateMutation.isError && (
          <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {moderateMutation.error instanceof ApiError ? moderateMutation.error.message : 'Không thể cập nhật trạng thái'}
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {ACTIONS.map((action) => (
            <Button
              key={action.trangThai}
              variant={action.variant}
              size="sm"
              disabled={r.TrangThai === action.trangThai || moderateMutation.isPending}
              onClick={() => moderateMutation.mutate({ id: reviewId, trangThai: action.trangThai })}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
