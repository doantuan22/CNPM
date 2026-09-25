import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên ít nhất 2 ký tự'),
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>();

  const onSubmit = async (data: RegisterFormInputs) => {
    const result = registerSchema.safeParse(data);
    if (!result.success) return;
    // Auth logic will be implemented in subsequent phases per TECH-0
  };

  return (
    <div className="mx-auto max-w-md space-y-6 pt-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đăng ký tài khoản</h1>
        <p className="text-sm text-slate-500">Tạo tài khoản để bắt đầu trải nghiệm đặt phòng dễ dàng</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Họ và tên</label>
            <input
              type="text"
              {...register('fullName', { required: true })}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Nguyễn Văn A"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              {...register('email', { required: true })}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="name@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
            <input
              type="password"
              {...register('password', { required: true })}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
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
