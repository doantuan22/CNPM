import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../components/common/Button';
import { useApplyPartner, useMyPartnerApplication } from '../features/partners/hooks';
import { applyPartnerSchema, ApplyPartnerFormValues } from '../features/partners/schemas';
import { ApiError } from '../services/apiClient';

const statusLabel: Record<string, { text: string; className: string }> = {
  'Chờ duyệt': { text: 'Đang chờ duyệt', className: 'bg-amber-50 text-amber-700' },
  'Đã duyệt': { text: 'Đã được duyệt', className: 'bg-green-50 text-green-700' },
  'Từ chối': { text: 'Đã bị từ chối', className: 'bg-red-50 text-red-700' },
};

export default function PartnerApplyPage() {
  const applicationQuery = useMyPartnerApplication();
  const applyMutation = useApplyPartner();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplyPartnerFormValues>({ resolver: zodResolver(applyPartnerSchema) });

  if (applicationQuery.isLoading) {
    return (
      <div className="flex justify-center py-16" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  const existing = applicationQuery.data;
  const hasActiveApplication = existing && existing.TrangThaiDuyet !== 'Từ chối';

  const onSubmit = (data: ApplyPartnerFormValues) => applyMutation.mutate(data);

  return (
    <div className="mx-auto max-w-lg space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đăng ký đối tác</h1>
        <p className="text-sm text-slate-500">
          Hoàn tất hồ sơ để trở thành Chủ khách sạn trên nền tảng. Hồ sơ sẽ được quản trị viên xét duyệt.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        {(applyMutation.data ?? existing) && hasActiveApplication ? (
          <div className="space-y-3 text-center">
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                statusLabel[(applyMutation.data ?? existing)!.TrangThaiDuyet].className
              }`}
            >
              {statusLabel[(applyMutation.data ?? existing)!.TrangThaiDuyet].text}
            </span>
            <p className="text-sm text-slate-500">
              Hồ sơ đối tác của bạn đã được ghi nhận. Chức năng duyệt hồ sơ sẽ được triển khai ở giai đoạn
              sau.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {existing?.TrangThaiDuyet === 'Từ chối' && (
              <div role="alert" className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Hồ sơ trước đó đã bị từ chối{existing.LyDoTuChoi ? `: ${existing.LyDoTuChoi}` : ''}. Bạn có
                thể nộp lại hồ sơ mới bên dưới.
              </div>
            )}
            {applyMutation.isError && (
              <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {applyMutation.error instanceof ApiError
                  ? applyMutation.error.message
                  : 'Nộp hồ sơ thất bại, vui lòng thử lại'}
              </div>
            )}

            <div>
              <label htmlFor="SoCCCD" className="block text-sm font-medium text-slate-700">
                Số CCCD
              </label>
              <input
                id="SoCCCD"
                type="text"
                {...register('SoCCCD')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.SoCCCD && <p className="mt-1 text-xs text-red-600">{errors.SoCCCD.message}</p>}
            </div>

            <div>
              <label htmlFor="SoGiayPhepKinhDoanh" className="block text-sm font-medium text-slate-700">
                Số giấy phép kinh doanh
              </label>
              <input
                id="SoGiayPhepKinhDoanh"
                type="text"
                {...register('SoGiayPhepKinhDoanh')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.SoGiayPhepKinhDoanh && (
                <p className="mt-1 text-xs text-red-600">{errors.SoGiayPhepKinhDoanh.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="MaSoThue" className="block text-sm font-medium text-slate-700">
                Mã số thuế
              </label>
              <input
                id="MaSoThue"
                type="text"
                {...register('MaSoThue')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.MaSoThue && <p className="mt-1 text-xs text-red-600">{errors.MaSoThue.message}</p>}
            </div>

            <div>
              <label htmlFor="TepGiayTo" className="block text-sm font-medium text-slate-700">
                Đường dẫn tệp giấy tờ
              </label>
              <input
                id="TepGiayTo"
                type="text"
                {...register('TepGiayTo')}
                placeholder="https://..."
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.TepGiayTo && <p className="mt-1 text-xs text-red-600">{errors.TepGiayTo.message}</p>}
              <p className="mt-1 text-xs text-slate-400">
                Giai đoạn hiện tại yêu cầu đường dẫn tới tệp đã tải lên nơi khác; tải tệp trực tiếp sẽ được
                hỗ trợ ở phiên bản sau.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || applyMutation.isPending}>
              {isSubmitting || applyMutation.isPending ? 'Đang gửi...' : 'Nộp hồ sơ đối tác'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
