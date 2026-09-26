import { useState } from 'react';
import { Star, MessageSquareText } from 'lucide-react';
import { Button } from '../common/Button';
import { useCreateReview, useMyReview } from '../../features/reviews/hooks';
import { reviewStatusBadgeClass } from '../../features/reviews/status';
import { fileToDataUrl, cn } from '../../lib/utils';
import { ApiError } from '../../services/apiClient';

const MAX_IMAGES = 6;

interface ReviewSectionProps {
  bookingId: number;
  bookingStatus: string;
}

export function ReviewSection({ bookingId, bookingStatus }: ReviewSectionProps) {
  const isCompleted = bookingStatus === 'Hoàn tất';
  const reviewQuery = useMyReview(bookingId, isCompleted);
  const createMutation = useCreateReview(bookingId);

  const [score, setScore] = useState(5);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  if (!isCompleted) return null;

  const onFilesSelected = (list: FileList | null) => {
    if (!list) return;
    setFiles(Array.from(list).slice(0, MAX_IMAGES));
  };

  const submit = async () => {
    const hinhAnh = files.length > 0 ? await Promise.all(files.map(fileToDataUrl)) : undefined;
    createMutation.mutate({ diemDanhGia: score, noiDung: content.trim() || undefined, hinhAnh });
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <MessageSquareText className="h-5 w-5 text-slate-400" /> Đánh giá
      </h2>

      {reviewQuery.isLoading ? (
        <div className="flex justify-center py-6" role="status" aria-live="polite">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      ) : reviewQuery.data ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn('h-4 w-4', i < reviewQuery.data!.DiemDanhGia ? 'fill-amber-400 text-amber-400' : 'text-slate-300')}
                />
              ))}
            </div>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', reviewStatusBadgeClass(reviewQuery.data.TrangThai))}>
              {reviewQuery.data.TrangThai}
            </span>
          </div>
          {reviewQuery.data.NoiDung && <p className="text-sm text-slate-700">{reviewQuery.data.NoiDung}</p>}
          {reviewQuery.data.HINH_ANH_DANH_GIA.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {reviewQuery.data.HINH_ANH_DANH_GIA.map((img) => (
                <img key={img.MaHinhAnhDanhGia} src={img.URL} alt="" className="h-16 w-16 rounded-lg object-cover" />
              ))}
            </div>
          )}
          <p className="text-xs text-slate-500">Cảm ơn bạn đã đánh giá — đánh giá đang chờ kiểm duyệt trước khi hiển thị công khai.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium text-slate-600">Chấm điểm</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} sao`}
                  onClick={() => setScore(value)}
                  className="rounded p-0.5"
                >
                  <Star className={cn('h-6 w-6', value <= score ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="review-content" className="mb-1 block text-xs font-medium text-slate-600">
              Nhận xét (không bắt buộc)
            </label>
            <textarea
              id="review-content"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="review-images" className="mb-1 block text-xs font-medium text-slate-600">
              Ảnh (tối đa {MAX_IMAGES}, không bắt buộc)
            </label>
            <input
              id="review-images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onFilesSelected(e.target.files)}
              className="block w-full text-sm"
            />
            {files.length > 0 && <p className="mt-1 text-xs text-slate-500">Đã chọn {files.length} ảnh</p>}
          </div>

          {createMutation.isError && (
            <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {createMutation.error instanceof ApiError ? createMutation.error.message : 'Không thể gửi đánh giá'}
            </div>
          )}

          <Button className="w-full" onClick={submit} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </div>
      )}
    </div>
  );
}
