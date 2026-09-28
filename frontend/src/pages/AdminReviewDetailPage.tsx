import { Link, useParams } from 'react-router-dom';
import { useAdminReviewDetail, useModerateReview, useRemoveViolationReview } from '../features/reviews/hooks';
import { ApiError } from '../services/apiClient';
import { useConfirm } from '../components/common/FeedbackProvider';
import { StatusBadge } from '../components/domain/StatusBadge';

export default function AdminReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const reviewId = Number(id);
  const reviewQuery = useAdminReviewDetail(reviewId);
  const moderateMutation = useModerateReview();
  const removeMutation = useRemoveViolationReview();
  const confirm = useConfirm();

  if (reviewQuery.isLoading) {
    return <div className="flex justify-center py-16" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span className="sr-only">Đang tải...</span></div>;
  }

  if (reviewQuery.isError || !reviewQuery.data) {
    return <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700 border border-red-200">{reviewQuery.error instanceof ApiError ? reviewQuery.error.message : 'Không tìm thấy đánh giá'}</div>;
  }

  const r = reviewQuery.data;

  const renderStars = (score: number) => {
    const starsHTML = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= score) {
        starsHTML.push(<span key={i} className="text-amber-500">★</span>);
      } else {
        starsHTML.push(<span key={i} className="text-slate-300">★</span>);
      }
    }
    return <div className="flex items-center gap-0.5 text-lg">{starsHTML}</div>;
  };

  return (
    <div className="flex flex-col gap-6 max-w-[600px] mx-auto w-full">
      <Link to="/admin/reviews" className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại danh sách</span>
      </Link>

      <div className="bg-white border border-border rounded-[16px] shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
              ★
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-heading">Chi tiết đánh giá của du khách</h3>
                <StatusBadge domain="review" status={r.TrangThai} />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Booking: <strong className="font-mono">{r.DAT_PHONG.MaXacNhanDatPhong}</strong> • {r.DAT_PHONG.NgayNhanPhong} → {r.DAT_PHONG.NgayTraPhong}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {moderateMutation.isError && (
             <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
               {moderateMutation.error instanceof ApiError ? moderateMutation.error.message : 'Không thể cập nhật trạng thái'}
             </div>
          )}
          {removeMutation.isError && (
             <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
               {removeMutation.error instanceof ApiError ? removeMutation.error.message : 'Không thể gỡ đánh giá'}
             </div>
          )}
          {removeMutation.isSuccess && (
             <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
               Đánh giá đã được gỡ khỏi phần hiển thị công khai; dữ liệu và ảnh vẫn được lưu để kiểm tra.
             </div>
          )}

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <div>
              <div className="font-bold text-heading text-sm">{r.TAI_KHOAN.HoTen} <span className="font-normal text-slate-500 text-xs">({r.TAI_KHOAN.Email})</span></div>
              <div className="text-[11px] text-slate-500 mt-1">Khách sạn: <strong className="text-slate-700">{r.KHACH_SAN.TenKhachSan}</strong></div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {renderStars(r.DiemDanhGia)}
              <span className="font-bold text-amber-500 tracking-wider text-sm">{r.DiemDanhGia}.0 / 5</span>
            </div>
          </div>

          <div>
            <p className="block font-semibold text-slate-600 mb-1.5 text-[11px] uppercase tracking-wider">Nội dung đánh giá:</p>
            <div className="p-4 bg-white border border-border rounded-xl text-slate-700 leading-relaxed font-medium text-sm whitespace-pre-wrap shadow-sm">
              {r.NoiDung || <span className="text-slate-400 italic">Không có nội dung bình luận</span>}
            </div>
          </div>

          {r.HINH_ANH_DANH_GIA.length > 0 && (
            <div>
              <p className="block font-semibold text-slate-600 mb-1.5 text-[11px] uppercase tracking-wider">Hình ảnh đính kèm:</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {r.HINH_ANH_DANH_GIA.map((img) => (
                  <a key={img.MaHinhAnhDanhGia} href={img.URL} target="_blank" rel="noreferrer" className="block aspect-square rounded-xl overflow-hidden border border-border shadow-sm hover:opacity-90 transition">
                    <img src={img.URL} alt="Ảnh đánh giá" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {r.TrangThai === 'Vi phạm' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1 shadow-sm">
              <strong className="font-bold flex items-center gap-1.5 text-rose-700 text-sm">
                <i className="ph-fill ph-warning-circle text-lg"></i>
                Đánh giá có dấu hiệu vi phạm
              </strong>
              <p className="text-[11px] leading-relaxed text-rose-700/80">
                Cần kiểm duyệt kỹ nội dung và hình ảnh. Có thể gỡ khỏi hệ thống hiển thị công khai.
              </p>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-border bg-slate-50 flex flex-col sm:flex-row items-center justify-end gap-3">
          {r.TrangThai !== 'Hiển thị' && (
            <button
              disabled={moderateMutation.isPending || removeMutation.isPending}
              onClick={() => moderateMutation.mutate({ id: reviewId, trangThai: 'Hiển thị' })}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
            >
              Duyệt (Hiển thị)
            </button>
          )}
          
          {r.TrangThai !== 'Ẩn' && (
            <button
              disabled={moderateMutation.isPending || removeMutation.isPending}
              onClick={() => moderateMutation.mutate({ id: reviewId, trangThai: 'Ẩn' })}
              className="w-full sm:w-auto px-4 py-2.5 bg-white border border-border text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
            >
              Ẩn đánh giá
            </button>
          )}

          {r.TrangThai !== 'Vi phạm' && (
            <button
              disabled={moderateMutation.isPending || removeMutation.isPending}
              onClick={() => moderateMutation.mutate({ id: reviewId, trangThai: 'Vi phạm' })}
              className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-bold hover:bg-rose-100 transition disabled:opacity-50"
            >
              Đánh dấu vi phạm
            </button>
          )}
          
          {(r.TrangThai === 'Vi phạm' || r.TrangThai === 'Ẩn') && (
            <button
              disabled={r.TrangThai === 'Ẩn' || removeMutation.isPending}
              onClick={() => { void confirm({ title: 'Gỡ đánh giá khỏi phần công khai?', description: 'Dữ liệu và ảnh vẫn được lưu để phục vụ kiểm tra.', confirmLabel: 'Gỡ đánh giá', variant: 'danger' }).then((accepted) => { if (accepted) removeMutation.mutate(reviewId); }); }}
              className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition shadow-sm disabled:opacity-50"
            >
              {removeMutation.isPending ? 'Đang gỡ...' : r.TrangThai === 'Ẩn' ? 'Đã gỡ' : 'Xóa / gỡ khỏi công khai'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
