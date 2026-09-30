import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLogin } from '../features/auth/hooks';
import { loginSchema, LoginFormValues } from '../features/auth/schemas';
import { ApiError } from '../services/apiClient';
import { ROLE_HOME } from '../lib/roles';
import { decodeAccessToken } from '../lib/jwt';
import { useAuthStore } from '../lib/authStore';
import { cn } from '../lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string; search?: string } } };
  const loginMutation = useLogin();
  
  const [showSessionExpired] = useState(() => useAuthStore.getState().sessionExpired);
  useEffect(() => {
    useAuthStore.getState().acknowledgeSessionExpired();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await loginMutation.mutateAsync(data);
      const decoded = decodeAccessToken(result.accessToken);
      const fallback = (decoded && ROLE_HOME[decoded.role]) || '/';
      const returnTo = location.state?.from;
      navigate(returnTo?.pathname ? `${returnTo.pathname}${returnTo.search ?? ''}` : fallback, { replace: true });
    } catch {
      // surfaced via loginMutation.isError below
    }
  };
  
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="flex-grow flex items-center justify-center relative overflow-hidden bg-surface-secondary min-h-[80vh]">
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-20 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[460px] mx-auto z-10 p-4">
        <div className="bg-white rounded-2xl border border-border shadow-lg p-6 sm:p-8 sm:py-9">
          
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-ink">Đăng nhập</h1>
            <p className="text-ink-muted text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
              Chào mừng bạn quay lại! Hãy đăng nhập để tiếp tục trải nghiệm cùng Egode.
            </p>
          </div>

          {showSessionExpired && !loginMutation.isError && (
            <div role="alert" className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 border border-amber-200">
              Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.
            </div>
          )}
          {loginMutation.isError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {loginMutation.error instanceof ApiError
                ? loginMutation.error.message
                : 'Đăng nhập thất bại, vui lòng thử lại'}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            
            <div>
              <label htmlFor="identifier" className="block text-xs font-semibold text-ink mb-1.5 uppercase tracking-wide">
                Email hoặc Tên đăng nhập <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="ph ph-user text-lg"></i>
                </div>
                <input 
                  type="text" 
                  id="identifier" 
                  placeholder="VD: user@egode.vn hoặc username"
                  className={cn("w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white text-ink text-sm placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-150", errors.identifier ? "border-rose-500 bg-rose-50/20" : "border-border")}
                  {...register('identifier')}
                />
              </div>
              {errors.identifier && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                  <i className="ph-fill ph-warning-circle"></i>
                  <span>{errors.identifier.message}</span>
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="MatKhau" className="block text-xs font-semibold text-ink uppercase tracking-wide">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                   <i className="ph ph-lock-key text-lg"></i>
                </div>
                <input 
                  type={showPwd ? "text" : "password"}
                  id="MatKhau" 
                  placeholder="••••••••"
                  className={cn("w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white text-ink text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-150", errors.MatKhau ? "border-rose-500 bg-rose-50/20" : "border-border")}
                  {...register('MatKhau')}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-ink transition-colors focus:outline-none"
                >
                  <i className={cn("ph text-lg", showPwd ? "ph-eye" : "ph-eye-slash")}></i>
                </button>
              </div>
              {errors.MatKhau && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                  <i className="ph-fill ph-warning-circle"></i>
                  <span>{errors.MatKhau.message}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-end pt-1">
              <Link to="/forgot-password" className="text-xs sm:text-sm font-medium text-primary hover:text-primary-700 hover:underline transition-colors">
                Quên mật khẩu?
              </Link>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting || loginMutation.isPending}
                className="w-full py-2.5 px-4 bg-primary hover:bg-primary-700 active:bg-primary-800 text-white font-semibold rounded-xl shadow-md transition-all duration-200 transform active:scale-[0.99] flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-70"
              >
                <span>{isSubmitting || loginMutation.isPending ? 'Đang xử lý...' : 'Đăng nhập'}</span>
                <i className="ph-bold ph-arrow-right"></i>
              </button>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-ink-muted uppercase tracking-wider font-medium">Hoặc</span>
            </div>
          </div>

          <div className="mt-8 text-center text-xs sm:text-sm text-ink-muted">
            Chưa có tài khoản?
            <Link to="/register" className="font-semibold text-primary hover:text-primary-700 transition-colors ml-1">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
