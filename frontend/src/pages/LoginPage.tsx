import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useLogin } from '../features/auth/hooks';
import { loginSchema, LoginFormValues } from '../features/auth/schemas';
import { ApiError } from '../services/apiClient';
import { ROLE_NAMES } from '../lib/roles';
import { decodeAccessToken } from '../lib/jwt';

const roleHome: Record<string, string> = {
  [ROLE_NAMES.ADMIN]: '/admin',
  [ROLE_NAMES.PARTNER]: '/owner',
  [ROLE_NAMES.CUSTOMER]: '/',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string } } };
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await loginMutation.mutateAsync(data);
      const decoded = decodeAccessToken(result.accessToken);
      const fallback = (decoded && roleHome[decoded.role]) || '/';
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch {
      // surfaced via loginMutation.isError below
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 pt-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đăng nhập tài khoản</h1>
        <p className="text-sm text-slate-500">Chào mừng bạn quay lại hệ thống đặt phòng</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        {loginMutation.isError && (
          <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {loginMutation.error instanceof ApiError
              ? loginMutation.error.message
              : 'Đăng nhập thất bại, vui lòng thử lại'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-slate-700">
              Email hoặc tên đăng nhập
            </label>
            <input
              id="identifier"
              type="text"
              {...register('identifier')}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="name@example.com"
            />
            {errors.identifier && (
              <p className="mt-1 text-xs text-red-600">{errors.identifier.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="MatKhau" className="block text-sm font-medium text-slate-700">
                Mật khẩu
              </label>
              <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <input
              id="MatKhau"
              type="password"
              {...register('MatKhau')}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {errors.MatKhau && <p className="mt-1 text-xs text-red-600">{errors.MatKhau.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || loginMutation.isPending}>
            {isSubmitting || loginMutation.isPending ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
