import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useLogin } from '../../features/auth/hooks';
import { loginSchema, type LoginFormValues } from '../../features/auth/schemas';
import { ApiError } from '../../services/apiClient';
import { ROLE_HOME } from '../../lib/roles';
import { decodeAccessToken } from '../../lib/jwt';
import { useAuthStore } from '../../lib/authStore';
import { cn } from '../../lib/utils';
import { Button } from '../../components/common/Button';

const LOGO_SRC = '/egode_logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: {
      from?: {
        pathname?: string;
        search?: string;
      };
    };
  };

  const loginMutation = useLogin();
  const [showSessionExpired] = useState(
    () => useAuthStore.getState().sessionExpired
  );
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    useAuthStore.getState().acknowledgeSessionExpired();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await loginMutation.mutateAsync(data);
      const decoded = decodeAccessToken(result.accessToken);
      const fallback = (decoded && ROLE_HOME[decoded.role]) || '/';
      const returnTo = location.state?.from;

      navigate(
        returnTo?.pathname
          ? `${returnTo.pathname}${returnTo.search ?? ''}`
          : fallback,
        { replace: true }
      );
    } catch {
      // Lỗi được hiển thị bằng loginMutation.isError bên dưới form.
    }
  };

  const inputClass = (hasError?: boolean) =>
    cn(
      `
        h-12
        w-full
        rounded-xl
        border
        bg-white
        py-0
        text-[15px]
        font-medium
        leading-none
        text-slate-900
        outline-none
        transition-all
        duration-200
        placeholder:font-normal
        placeholder:text-slate-400
        focus:border-primary
        focus:ring-4
        focus:ring-primary/10
      `,
      hasError
        ? 'border-danger bg-danger-light/20'
        : 'border-slate-200 hover:border-slate-300'
    );

  const busy = isSubmitting || loginMutation.isPending;

  return (
    <main
      className="relative isolate min-h-[calc(100vh-var(--header-height))] overflow-hidden bg-slate-950 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/login_bg.jpg')",
        fontFamily: 'var(--font-family), "Segoe UI", Arial, sans-serif',
      }}
    >
      {/* Overlay giúp chữ và form luôn rõ trên mọi ảnh nền. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/80 via-slate-900/52 to-slate-900/18" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-[42%] bg-gradient-to-t from-slate-950/45 to-transparent" />

      <div className="mx-auto flex min-h-[calc(100vh-var(--header-height))] w-full max-w-[1440px] items-center px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,520px)] xl:gap-16">
          {/* LEFT HERO */}
          <section className="hidden lg:block">
            <div className="max-w-[720px]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-md">
                <i className="ph ph-map-pin text-base text-sky-300" aria-hidden="true" />
                Đặt phòng dễ dàng cùng Egode
              </div>

              <h1 className="max-w-[690px] text-[clamp(3rem,4.4vw,4.65rem)] font-extrabold leading-[1.06] tracking-[-0.045em] text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.45)]">
                Chào mừng trở lại
                <span className="mt-2 block text-sky-300">cùng Egode.</span>
              </h1>

              <div className="mt-5 h-1 w-28 rounded-full bg-gradient-to-r from-sky-300 to-blue-500" />

              <p className="mt-6 max-w-[610px] text-base font-medium leading-7 text-slate-100 [text-shadow:0_2px_10px_rgba(0,0,0,0.35)]">
                Đăng nhập để tiếp tục tìm kiếm khách sạn, quản lý chuyến đi
                và hoàn tất những kỳ nghỉ bạn đang lên kế hoạch.
              </p>

              <div className="mt-8 grid max-w-[680px] grid-cols-3 gap-4">
                <LoginFeatureCard
                  icon="ph-map-pin"
                  title="Khám phá"
                  description="Tìm điểm đến và khách sạn phù hợp."
                />
                <LoginFeatureCard
                  icon="ph-shield-check"
                  title="An tâm"
                  description="Thông tin tài khoản được bảo vệ."
                />
                <LoginFeatureCard
                  icon="ph-lightning"
                  title="Nhanh chóng"
                  description="Tiếp tục đặt phòng chỉ trong vài bước."
                />
              </div>
            </div>
          </section>

          {/* LOGIN CARD */}
          <div className="flex w-full justify-center lg:justify-end">
            <section className="w-full max-w-[500px] rounded-[28px] border border-white/70 bg-white/95 px-6 py-7 shadow-[0_28px_80px_rgba(15,23,42,0.32)] backdrop-blur-xl sm:px-8 sm:py-8">
              <div className="mb-5 flex justify-center">
                <img
                  src={LOGO_SRC}
                  alt="Egode"
                  className="h-[58px] w-auto max-w-[190px] object-contain"
                />
              </div>

              <header className="mb-7 text-center">
                <h2 className="text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-slate-900">
                  Đăng nhập
                </h2>
                <p className="mx-auto mt-2 max-w-[380px] text-[14px] font-normal leading-6 text-slate-500">
                  Chào mừng bạn quay lại. Đăng nhập để tiếp tục trải nghiệm
                  cùng Egode.
                </p>
              </header>

              {showSessionExpired && !loginMutation.isError && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning-light px-4 py-3 text-sm font-medium leading-5 text-warning-ink"
                >
                  <i className="ph-fill ph-warning-circle mt-0.5 shrink-0 text-lg" aria-hidden="true" />
                  <span>Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.</span>
                </div>
              )}

              {loginMutation.isError && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger-light px-4 py-3 text-sm font-medium leading-5 text-danger-ink"
                >
                  <i className="ph-fill ph-warning-circle mt-0.5 shrink-0 text-lg" aria-hidden="true" />
                  <span>
                    {loginMutation.error instanceof ApiError
                      ? loginMutation.error.message
                      : 'Đăng nhập thất bại, vui lòng thử lại'}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div>
                  <label
                    htmlFor="identifier"
                    className="mb-2 block text-[13px] font-bold leading-5 text-slate-700"
                  >
                    Email hoặc tên đăng nhập <span className="text-danger">*</span>
                  </label>

                  <div className="relative">
                    <i
                      className="ph ph-user pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg leading-none text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      id="identifier"
                      placeholder="Email hoặc tên đăng nhập"
                      autoComplete="username"
                      className={cn(inputClass(!!errors.identifier), 'pl-10 pr-3.5')}
                      aria-invalid={!!errors.identifier}
                      {...register('identifier')}
                    />
                  </div>

                  {errors.identifier && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium leading-5 text-danger">
                      <i className="ph-fill ph-warning-circle shrink-0" aria-hidden="true" />
                      <span>{errors.identifier.message}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="MatKhau"
                    className="mb-2 block text-[13px] font-bold leading-5 text-slate-700"
                  >
                    Mật khẩu <span className="text-danger">*</span>
                  </label>

                  <div className="relative">
                    <i
                      className="ph ph-lock-key pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg leading-none text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      id="MatKhau"
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                      className={cn(inputClass(!!errors.MatKhau), 'pl-10 pr-12')}
                      aria-invalid={!!errors.MatKhau}
                      {...register('MatKhau')}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPwd((current) => !current)}
                      className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      aria-label={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      <i
                        className={cn('ph text-lg leading-none', showPwd ? 'ph-eye' : 'ph-eye-slash')}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  {errors.MatKhau && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium leading-5 text-danger">
                      <i className="ph-fill ph-warning-circle shrink-0" aria-hidden="true" />
                      <span>{errors.MatKhau.message}</span>
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-0.5">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold leading-5 text-primary transition hover:text-primary-700 hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={busy}
                  className="min-h-12 w-full justify-center text-[15px] font-bold"
                >
                  {busy ? (
                    <>
                      <span>Đang xử lý...</span>
                      <span
                        className="spinner h-4 w-4 border-2 border-white/20 border-t-white"
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <i className="ph ph-arrow-right text-lg leading-none" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3" aria-hidden="true">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium leading-none text-slate-400">hoặc</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <p className="text-center text-sm font-normal leading-6 text-slate-500">
                Chưa có tài khoản?{' '}
                <Link
                  to="/register"
                  className="font-bold text-primary transition hover:text-primary-700 hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

interface LoginFeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function LoginFeatureCard({ icon, title, description }: LoginFeatureCardProps) {
  return (
    <article className="min-h-[150px] rounded-[20px] border border-white/20 bg-slate-950/45 p-5 shadow-lg backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-slate-900/60">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-sky-300">
        <i className={`ph ${icon} text-[24px] leading-none`} aria-hidden="true" />
      </div>

      <h3 className="text-[16px] font-bold leading-6 text-white">{title}</h3>
      <p className="mt-1.5 text-[13px] font-normal leading-5 text-slate-200">
        {description}
      </p>
    </article>
  );
}
