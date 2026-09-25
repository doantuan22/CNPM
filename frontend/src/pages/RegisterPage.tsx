import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useRegister } from '../features/auth/hooks';
import { registerSchema, RegisterFormValues } from '../features/auth/schemas';
import { ApiError } from '../services/apiClient';
import { cn } from '../lib/utils';

type RegisterIntent = 'customer' | 'partner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [intent, setIntent] = useState<RegisterIntent>('customer');
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync({
        TenDangNhap: data.TenDangNhap,
        Email: data.Email,
        MatKhau: data.MatKhau,
        HoTen: data.HoTen,
        SoDienThoai: data.SoDienThoai,
        NgaySinh: data.NgaySinh || undefined,
        GioiTinh: data.GioiTinh ? data.GioiTinh : undefined,
      });
      navigate(intent === 'partner' ? '/partner/apply' : '/', { replace: true });
    } catch {
      // surfaced via registerMutation.isError below
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 pt-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đăng ký tài khoản</h1>
        <p className="text-sm text-slate-500">Tạo tài khoản để bắt đầu trải nghiệm đặt phòng dễ dàng</p>
      </div>

      <div
        role="tablist"
        aria-label="Loại đăng ký"
        className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={intent === 'customer'}
          onClick={() => setIntent('customer')}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
            intent === 'customer' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
          )}
        >
          Đăng ký khách hàng
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={intent === 'partner'}
          onClick={() => setIntent('partner')}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
            intent === 'partner' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
          )}
        >
          Đăng ký đối tác
        </button>
      </div>

      {intent === 'partner' && (
        <p className="rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-700">
          Tạo tài khoản trước, sau đó bạn sẽ hoàn tất hồ sơ đối tác (giấy phép kinh doanh, mã số thuế) ở bước
          tiếp theo.
        </p>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        {registerMutation.isError && (
          <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {registerMutation.error instanceof ApiError
              ? registerMutation.error.message
              : 'Đăng ký thất bại, vui lòng thử lại'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="HoTen" className="block text-sm font-medium text-slate-700">
                Họ và tên
              </label>
              <input
                id="HoTen"
                type="text"
                {...register('HoTen')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Nguyễn Văn A"
              />
              {errors.HoTen && <p className="mt-1 text-xs text-red-600">{errors.HoTen.message}</p>}
            </div>
            <div>
              <label htmlFor="TenDangNhap" className="block text-sm font-medium text-slate-700">
                Tên đăng nhập
              </label>
              <input
                id="TenDangNhap"
                type="text"
                {...register('TenDangNhap')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="nguyenvana"
              />
              {errors.TenDangNhap && (
                <p className="mt-1 text-xs text-red-600">{errors.TenDangNhap.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="Email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="Email"
              type="email"
              {...register('Email')}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="name@example.com"
            />
            {errors.Email && <p className="mt-1 text-xs text-red-600">{errors.Email.message}</p>}
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
                placeholder="0912345678"
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
              defaultValue=""
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Không chọn</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
            {errors.GioiTinh && <p className="mt-1 text-xs text-red-600">{errors.GioiTinh.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="MatKhau" className="block text-sm font-medium text-slate-700">
                Mật khẩu
              </label>
              <input
                id="MatKhau"
                type="password"
                {...register('MatKhau')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
              {errors.MatKhau && <p className="mt-1 text-xs text-red-600">{errors.MatKhau.message}</p>}
            </div>
            <div>
              <label htmlFor="confirmMatKhau" className="block text-sm font-medium text-slate-700">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmMatKhau"
                type="password"
                {...register('confirmMatKhau')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
              {errors.confirmMatKhau && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmMatKhau.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || registerMutation.isPending}>
            {isSubmitting || registerMutation.isPending
              ? 'Đang xử lý...'
              : intent === 'partner'
                ? 'Đăng ký đối tác'
                : 'Đăng ký'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
