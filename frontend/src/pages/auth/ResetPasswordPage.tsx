import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPassword } from '../../features/auth/hooks';
import { resetPasswordSchema, ResetPasswordFormValues } from '../../features/auth/schemas';
import { ApiError } from '../../services/apiClient';
import { cn } from '../../lib/utils';

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

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

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
      <div className="bg-surface-secondary min-h-[80vh] flex items-center justify-center font-sans">
        <div className="bg-white w-full max-w-[580px] rounded-2xl shadow-lg border border-border p-6 sm:p-8 lg:p-10 text-center">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-4 text-3xl">
            <i className="ph-fill ph-warning-circle"></i>
          </div>
          <h1 className="text-2xl font-bold text-ink mb-2">Liên kết không hợp lệ</h1>
          <p className="text-sm text-ink-muted mb-6">Thiếu token đặt lại mật khẩu. Vui lòng yêu cầu lại từ trang quên mật khẩu.</p>
          <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:underline">Quên mật khẩu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-secondary font-sans text-ink min-h-[80vh] flex flex-col antialiased">
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="bg-white w-full max-w-[580px] rounded-2xl shadow-lg border border-border p-6 sm:p-8 lg:p-10">
          
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-border -z-10"></div>
            
            <div className="flex items-center gap-2 bg-white pr-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                <i className="ph-bold ph-check text-sm"></i>
              </div>
              <span className="text-sm font-medium text-ink hidden sm:inline">1. Nhập email</span>
            </div>

            <div className="flex items-center gap-2 bg-white px-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                <i className="ph-bold ph-check text-sm"></i>
              </div>
              <span className="text-sm font-medium text-ink hidden sm:inline">2. Kiểm tra email</span>
            </div>

            <div className="flex items-center gap-2 bg-white pl-2">
              <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold text-xs">3</div>
              <span className="text-sm font-bold text-primary">3. Đặt mật khẩu mới</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-blue-50 mb-4 text-primary relative">
              <i className="ph-fill ph-key text-3xl"></i>
              <div className="absolute bottom-0 right-0 bg-white rounded-full">
                <i className="ph-fill ph-check-circle text-primary text-xl"></i>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-ink mb-2">Đặt mật khẩu mới</h1>
            <p className="text-sm text-ink-muted leading-relaxed max-w-md mx-auto">
              Vui lòng nhập mật khẩu mới và xác nhận lại để hoàn tất việc đặt lại mật khẩu.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {mutation.isError && (
              <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {mutation.error instanceof ApiError ? mutation.error.message : 'Token không hợp lệ hoặc đã hết hạn'}
              </div>
            )}
            
            <input type="hidden" {...register('token')} />

            <div className="space-y-1.5">
              <label htmlFor="reset-password-field-1" className="block text-sm font-medium text-ink">Mật khẩu mới</label>
              <div className="relative">
                <input id="reset-password-field-1" 
                  type={showPwd ? "text" : "password"} 
                  placeholder="••••••••••" 
                  className={cn("w-full px-4 py-2.5 rounded-lg border bg-white text-ink text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all", errors.MatKhauMoi ? "border-rose-500 bg-rose-50/20" : "border-border")}
                  {...register('MatKhauMoi')}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-ink transition-colors focus:outline-none"
                >
                  <i className={cn("ph text-lg", showPwd ? "ph-eye" : "ph-eye-slash")}></i>
                </button>
              </div>
              {errors.MatKhauMoi && <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1"><i className="ph-fill ph-warning-circle"></i>{errors.MatKhauMoi.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reset-password-field-2" className="block text-sm font-medium text-ink">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <input id="reset-password-field-2" 
                  type={showConfirmPwd ? "text" : "password"} 
                  placeholder="••••••••••" 
                  className={cn("w-full px-4 py-2.5 rounded-lg border bg-white text-ink text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all", errors.confirmMatKhauMoi ? "border-rose-500 bg-rose-50/20" : "border-border")}
                  {...register('confirmMatKhauMoi')}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-ink transition-colors focus:outline-none"
                >
                  <i className={cn("ph text-lg", showConfirmPwd ? "ph-eye" : "ph-eye-slash")}></i>
                </button>
              </div>
              {errors.confirmMatKhauMoi && <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1"><i className="ph-fill ph-warning-circle"></i>{errors.confirmMatKhauMoi.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || mutation.isPending}
              className="w-full bg-primary hover:bg-primary-700 active:bg-primary-800 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md shadow-primary/30 mt-6 flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting || mutation.isPending ? (
                 <>Đang xử lý... <div className="spinner w-4 h-4 border-2 border-white/20 border-t-white" aria-hidden="true"></div></>
              ) : (
                'Cập nhật mật khẩu'
              )}
            </button>

            <div className="text-center mt-6">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                <i className="ph-bold ph-arrow-left"></i>
                Quay lại Đăng nhập
              </Link>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
