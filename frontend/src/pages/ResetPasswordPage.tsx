import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useResetPassword } from '../features/auth/hooks';
import { resetPasswordSchema, ResetPasswordFormValues } from '../features/auth/schemas';
import { ApiError } from '../services/apiClient';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const mutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      await mutation.mutateAsync(data);
      navigate('/login', { replace: true });
    } catch {
      // surfaced via mutation.isError below
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md space-y-4 pt-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Liên kết không hợp lệ</h1>
        <p className="text-sm text-slate-500">
          Thiếu token đặt lại mật khẩu. Vui lòng yêu cầu lại từ trang quên mật khẩu.
        </p>
        <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline">
          Quên mật khẩu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 pt-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đặt lại mật khẩu</h1>
        <p className="text-sm text-slate-500">Nhập mật khẩu mới cho tài khoản của bạn</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        {mutation.isError && (
          <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {mutation.error instanceof ApiError
              ? mutation.error.message
              : 'Token không hợp lệ hoặc đã hết hạn'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <input type="hidden" {...register('token')} />
          <div>
            <label htmlFor="MatKhauMoi" className="block text-sm font-medium text-slate-700">
              Mật khẩu mới
            </label>
            <input
              id="MatKhauMoi"
              type="password"
              {...register('MatKhauMoi')}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {errors.MatKhauMoi && <p className="mt-1 text-xs text-red-600">{errors.MatKhauMoi.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmMatKhauMoi" className="block text-sm font-medium text-slate-700">
              Xác nhận mật khẩu mới
            </label>
            <input
              id="confirmMatKhauMoi"
              type="password"
              {...register('confirmMatKhauMoi')}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {errors.confirmMatKhauMoi && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmMatKhauMoi.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || mutation.isPending}>
            {isSubmitting || mutation.isPending ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </Button>
        </form>
      </div>
    </div>
  );
}
