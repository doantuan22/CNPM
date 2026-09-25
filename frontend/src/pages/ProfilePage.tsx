import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../components/common/Button';
import { useMe, useUpdateProfile } from '../features/auth/hooks';
import { updateProfileSchema, UpdateProfileFormValues } from '../features/auth/schemas';
import { ApiError } from '../services/apiClient';

export default function ProfilePage() {
  const meQuery = useMe();
  const updateMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFormValues>({ resolver: zodResolver(updateProfileSchema) });

  useEffect(() => {
    if (meQuery.data) {
      reset({
        HoTen: meQuery.data.HoTen,
        SoDienThoai: meQuery.data.SoDienThoai,
        NgaySinh: meQuery.data.NgaySinh?.slice(0, 10) ?? '',
        GioiTinh: meQuery.data.GioiTinh ?? '',
      });
    }
  }, [meQuery.data, reset]);

  if (meQuery.isLoading) {
    return (
      <div className="flex justify-center py-16" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (meQuery.isError) {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
        {meQuery.error instanceof ApiError ? meQuery.error.message : 'Không thể tải thông tin cá nhân'}
      </div>
    );
  }

  const onSubmit = (data: UpdateProfileFormValues) =>
    updateMutation.mutate({
      HoTen: data.HoTen,
      SoDienThoai: data.SoDienThoai,
      NgaySinh: data.NgaySinh || undefined,
      GioiTinh: data.GioiTinh ? data.GioiTinh : undefined,
    });

  return (
    <div className="mx-auto max-w-lg space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thông tin cá nhân</h1>
        <p className="text-sm text-slate-500">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        <dl className="mb-6 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">Tên đăng nhập</dt>
            <dd className="font-medium text-slate-900">{meQuery.data?.TenDangNhap}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{meQuery.data?.Email}</dd>
          </div>
        </dl>

        {updateMutation.isSuccess && (
          <div role="status" className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Cập nhật thông tin thành công
          </div>
        )}
        {updateMutation.isError && (
          <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {updateMutation.error instanceof ApiError
              ? updateMutation.error.message
              : 'Cập nhật thất bại, vui lòng thử lại'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="HoTen" className="block text-sm font-medium text-slate-700">
              Họ và tên
            </label>
            <input
              id="HoTen"
              type="text"
              {...register('HoTen')}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.HoTen && <p className="mt-1 text-xs text-red-600">{errors.HoTen.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="SoDienThoai" className="block text-sm font-medium text-slate-700">
                Số điện thoại
              </label>
              <input
                id="SoDienThoai"
                type="tel"
                {...register('SoDienThoai')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.SoDienThoai && (
                <p className="mt-1 text-xs text-red-600">{errors.SoDienThoai.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="NgaySinh" className="block text-sm font-medium text-slate-700">
                Ngày sinh <span className="font-normal text-slate-400">(tùy chọn)</span>
              </label>
              <input
                id="NgaySinh"
                type="date"
                {...register('NgaySinh')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.NgaySinh && <p className="mt-1 text-xs text-red-600">{errors.NgaySinh.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="GioiTinh" className="block text-sm font-medium text-slate-700">
              Giới tính <span className="font-normal text-slate-400">(tùy chọn)</span>
            </label>
            <select
              id="GioiTinh"
              {...register('GioiTinh')}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Không chọn</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </form>
      </div>
    </div>
  );
}
