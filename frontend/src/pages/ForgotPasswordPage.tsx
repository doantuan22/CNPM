import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useForgotPassword } from '../features/auth/hooks';
import { forgotPasswordSchema, ForgotPasswordFormValues } from '../features/auth/schemas';

export default function ForgotPasswordPage() {
  const mutation = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = (data: ForgotPasswordFormValues) => mutation.mutate(data);

  return (
    <div className="mx-auto max-w-md space-y-6 pt-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quên mật khẩu</h1>
        <p className="text-sm text-slate-500">Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        {mutation.isSuccess ? (
          <div role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp
            thư của bạn.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {mutation.isError && (
              <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                Có lỗi xảy ra, vui lòng thử lại
              </div>
            )}
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
            <Button type="submit" className="w-full" disabled={isSubmitting || mutation.isPending}>
              {isSubmitting || mutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-slate-500">
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
