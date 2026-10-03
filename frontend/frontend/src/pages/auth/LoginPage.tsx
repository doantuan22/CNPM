import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useLogin } from '../../features/auth/hooks';
import {
  loginSchema,
  LoginFormValues,
} from '../../features/auth/schemas';

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

      const decoded = decodeAccessToken(
        result.accessToken
      );

      const fallback =
        (decoded && ROLE_HOME[decoded.role]) || '/';

      const returnTo = location.state?.from;

      navigate(
        returnTo?.pathname
          ? `${returnTo.pathname}${returnTo.search ?? ''}`
          : fallback,
        {
          replace: true,
        }
      );
    } catch {
      // Lỗi hiển thị bằng loginMutation.isError
    }
  };

  const inputClass = (hasError?: boolean) =>
    cn(
      `
        w-full
        rounded-xl
        border
        bg-white
        py-3
        text-sm
        font-medium
        text-slate-900
        outline-none
        transition-all
        duration-200
        placeholder:text-slate-400
        focus:border-primary
        focus:ring-4
        focus:ring-primary/10
      `,
      hasError
        ? 'border-danger bg-danger-light/20'
        : 'border-slate-200 hover:border-slate-300'
    );

  return (
    <div
      className="
        relative
        overflow-hidden
        bg-cover
        bg-center
        bg-no-repeat
      "
      style={{
        minHeight:
          'calc(100vh - var(--header-height))',

        backgroundImage:
          "url('/login_bg.jpg')",

        fontFamily:
          'var(--font-family)',
      }}
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-slate-950/62
          via-slate-900/25
          to-sky-900/5
        "
      />

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          h-[35%]
          bg-gradient-to-t
          from-slate-950/28
          to-transparent
        "
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          w-full
          max-w-[1500px]
          items-center
          px-7
          py-6
          lg:px-12
          xl:px-14
        "
        style={{
          minHeight:
            'calc(100vh - var(--header-height))',
        }}
      >
        <div
          className="
            grid
            w-full
            items-center
            gap-10
            lg:grid-cols-[1.05fr_0.95fr]
            xl:gap-14
          "
        >
          {/* =================================================
              LEFT HERO
          ================================================= */}

          <section className="hidden lg:block">
            <div className="max-w-[760px]">

              {/* DÒNG 1 */}

              <h1
                className="
                  whitespace-nowrap
                  text-[clamp(3rem,4vw,4.3rem)]
                  font-bold
                  italic
                  leading-[1]
                  tracking-[-0.035em]
                "
                style={{
                  fontFamily:
                    'Georgia, "Times New Roman", serif',

                  color: '#FFFFFF',

                  textShadow:
                    '0 3px 6px rgba(0,0,0,0.85), 0 10px 26px rgba(0,0,0,0.55)',
                }}
              >
                Chào mừng trở lại
              </h1>

              {/* DÒNG 2 */}

              <div
                className="
                  mt-1
                  whitespace-nowrap
                  text-[clamp(3.05rem,4.15vw,4.5rem)]
                  font-extrabold
                  italic
                  leading-[1]
                  tracking-[-0.045em]
                "
                style={{
                  fontFamily:
                    '"Segoe UI", Arial, Helvetica, sans-serif',
                }}
              >
                <span
                  style={{
                    color: '#FFFFFF',

                    textShadow:
                      '0 3px 6px rgba(0,0,0,0.85), 0 8px 22px rgba(0,0,0,0.50)',
                  }}
                >
                  cùng{' '}
                </span>

                <span
                  style={{
                    color: '#66D9FF',

                    textShadow:
                      '0 3px 6px rgba(0,0,0,0.75), 0 8px 20px rgba(0,0,0,0.45)',
                  }}
                >
                  Egode.
                </span>
              </div>

              {/* =================================================
                  BRUSH WAVE
              ================================================= */}

              <div className="mt-2 ml-[62px]">
                <svg
                  viewBox="0 0 560 48"
                  fill="none"
                  className="
                    h-[32px]
                    w-[430px]
                    overflow-visible
                  "
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="loginWaveGradient"
                      x1="0"
                      y1="0"
                      x2="560"
                      y2="0"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8BE8FF"
                        stopOpacity="0.08"
                      />

                      <stop
                        offset="12%"
                        stopColor="#75E2FF"
                        stopOpacity="0.95"
                      />

                      <stop
                        offset="50%"
                        stopColor="#55CEF5"
                      />

                      <stop
                        offset="86%"
                        stopColor="#72DFFF"
                        stopOpacity="0.9"
                      />

                      <stop
                        offset="100%"
                        stopColor="#A2EEFF"
                        stopOpacity="0.08"
                      />
                    </linearGradient>

                    <filter
                      id="loginWaveGlow"
                      x="-20%"
                      y="-100%"
                      width="140%"
                      height="300%"
                    >
                      <feGaussianBlur
                        stdDeviation="1.2"
                        result="blur"
                      />

                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <path
                    d="
                      M8 26
                      C86 12 167 8 252 10
                      C335 12 416 21 548 24

                      C431 27 343 24 255 21
                      C169 18 90 20 8 31
                      Z
                    "
                    fill="url(#loginWaveGradient)"
                    opacity="0.98"
                    filter="url(#loginWaveGlow)"
                  />

                  <path
                    d="
                      M118 36
                      C184 31 257 30 325 32
                      C383 34 430 37 477 41

                      C421 39 373 38 319 37
                      C252 35 186 35 118 39
                      Z
                    "
                    fill="#82E5FF"
                    opacity="0.32"
                  />
                </svg>
              </div>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-3
                  max-w-[650px]
                  text-[16px]
                  font-semibold
                  leading-7
                "
                style={{
                  color: '#FFFFFF',

                  textShadow:
                    '0 2px 5px rgba(0,0,0,0.95), 0 5px 14px rgba(0,0,0,0.55)',
                }}
              >
                Đăng nhập để tiếp tục khám phá
                khách sạn, quản lý chuyến đi và
                trải nghiệm những kỳ nghỉ tuyệt vời
                cùng Egode.
              </p>
            </div>

            {/* =================================================
                FEATURE CARDS
            ================================================= */}

            <div
              className="
                mt-8
                grid
                max-w-[680px]
                grid-cols-3
                gap-4
              "
            >
              <LoginFeatureCard
                icon="ph-map-pin"
                title="Khám phá"
                description="Tìm kiếm điểm đến và khách sạn phù hợp."
              />

              <LoginFeatureCard
                icon="ph-shield-check"
                title="An toàn"
                description="Thông tin và tài khoản được quản lý bảo mật."
              />

              <LoginFeatureCard
                icon="ph-cursor-click"
                title="Nhanh chóng"
                description="Tiếp tục hành trình chỉ với vài thao tác."
              />
            </div>
          </section>

          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <div className="flex justify-center lg:justify-end">
            <section
              className="
                w-full
                max-w-[520px]
                rounded-[30px]
                border
                border-white/80
                bg-white/95
                px-7
                py-7
                shadow-[0_25px_80px_rgba(15,23,42,0.28)]
                backdrop-blur-xl
                sm:px-8
              "
            >
              {/* LOGO */}

              <div className="mb-4 flex justify-center">
                <img
                  src={LOGO_SRC}
                  alt="Egode"
                  className="
                    h-[64px]
                    w-auto
                    max-w-[210px]
                    object-contain
                  "
                />
              </div>

              {/* HEADER */}

              <div className="mb-7 text-center">
                <h1
                  className="
                    text-[30px]
                    font-extrabold
                    tracking-[-0.025em]
                    text-slate-900
                  "
                >
                  Đăng nhập
                </h1>

                <p
                  className="
                    mx-auto
                    mt-1.5
                    max-w-[390px]
                    text-sm
                    font-medium
                    leading-6
                    text-slate-500
                  "
                >
                  Chào mừng bạn quay lại!
                  Đăng nhập để tiếp tục trải nghiệm
                  cùng Egode.
                </p>
              </div>

              {/* SESSION EXPIRED */}

              {showSessionExpired &&
                !loginMutation.isError && (
                  <div
                    role="alert"
                    className="
                      mb-4
                      flex
                      items-start
                      gap-2.5
                      rounded-xl
                      border
                      border-warning/30
                      bg-warning-light
                      px-4
                      py-3
                      text-sm
                      font-medium
                      text-warning-ink
                    "
                  >
                    <i className="ph-fill ph-warning-circle mt-0.5 text-lg" />

                    <span>
                      Phiên đăng nhập đã hết hạn.
                      Vui lòng đăng nhập lại.
                    </span>
                  </div>
                )}

              {/* LOGIN ERROR */}

              {loginMutation.isError && (
                <div
                  role="alert"
                  className="
                    mb-4
                    flex
                    items-start
                    gap-2.5
                    rounded-xl
                    border
                    border-danger/30
                    bg-danger-light
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-danger-ink
                  "
                >
                  <i className="ph-fill ph-warning-circle mt-0.5 text-lg" />

                  <span>
                    {loginMutation.error instanceof
                    ApiError
                      ? loginMutation.error.message
                      : 'Đăng nhập thất bại, vui lòng thử lại'}
                  </span>
                </div>
              )}

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
                noValidate
              >
                {/* IDENTIFIER */}

                <div className="space-y-1.5">
                  <label
                    htmlFor="identifier"
                    className="
                      block
                      text-xs
                      font-bold
                      uppercase
                      tracking-wide
                      text-slate-700
                    "
                  >
                    Email hoặc tên đăng nhập

                    <span className="text-danger">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <i
                      className="
                        ph
                        ph-user
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        text-lg
                        text-slate-400
                      "
                    />

                    <input
                      type="text"
                      id="identifier"
                      placeholder="Email hoặc tên đăng nhập"
                      autoComplete="username"
                      className={cn(
                        inputClass(
                          !!errors.identifier
                        ),
                        'pl-10 pr-3.5'
                      )}
                      {...register('identifier')}
                    />
                  </div>

                  {errors.identifier && (
                    <p
                      className="
                        flex
                        items-center
                        gap-1
                        text-xs
                        font-medium
                        text-danger
                      "
                    >
                      <i className="ph-fill ph-warning-circle" />

                      <span>
                        {
                          errors.identifier
                            .message
                        }
                      </span>
                    </p>
                  )}
                </div>

                {/* PASSWORD */}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="MatKhau"
                      className="
                        block
                        text-xs
                        font-bold
                        uppercase
                        tracking-wide
                        text-slate-700
                      "
                    >
                      Mật khẩu

                      <span className="text-danger">
                        *
                      </span>
                    </label>
                  </div>

                  <div className="relative">
                    <i
                      className="
                        ph
                        ph-lock-key
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        text-lg
                        text-slate-400
                      "
                    />

                    <input
                      type={
                        showPwd
                          ? 'text'
                          : 'password'
                      }
                      id="MatKhau"
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                      className={cn(
                        inputClass(
                          !!errors.MatKhau
                        ),
                        'pl-10 pr-11'
                      )}
                      {...register('MatKhau')}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPwd(!showPwd)
                      }
                      className="
                        absolute
                        right-3.5
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                        transition
                        hover:text-slate-800
                      "
                      aria-label={
                        showPwd
                          ? 'Ẩn mật khẩu'
                          : 'Hiện mật khẩu'
                      }
                    >
                      <i
                        className={cn(
                          'ph text-lg',

                          showPwd
                            ? 'ph-eye'
                            : 'ph-eye-slash'
                        )}
                      />
                    </button>
                  </div>

                  {errors.MatKhau && (
                    <p
                      className="
                        flex
                        items-center
                        gap-1
                        text-xs
                        font-medium
                        text-danger
                      "
                    >
                      <i className="ph-fill ph-warning-circle" />

                      <span>
                        {
                          errors.MatKhau
                            .message
                        }
                      </span>
                    </p>
                  )}
                </div>

                {/* FORGOT PASSWORD */}

                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="
                      text-sm
                      font-semibold
                      text-primary
                      transition
                      hover:text-primary-700
                      hover:underline
                    "
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                {/* LOGIN BUTTON */}

                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    isSubmitting ||
                    loginMutation.isPending
                  }
                  className="w-full"
                >
                  {isSubmitting ||
                  loginMutation.isPending ? (
                    <>
                      Đang xử lý...

                      <div
                        className="
                          spinner
                          h-4
                          w-4
                          border-2
                          border-white/20
                          border-t-white
                        "
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <>
                      Đăng nhập

                      <i className="ph ph-arrow-right ml-1 text-lg" />
                    </>
                  )}
                </Button>
              </form>

              {/* DIVIDER */}

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs font-medium text-slate-400">
                  hoặc
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* REGISTER */}

              <p className="text-center text-sm font-medium text-slate-500">
                Chưa có tài khoản?{' '}

                <Link
                  to="/register"
                  className="
                    font-bold
                    text-primary
                    transition
                    hover:text-primary-700
                    hover:underline
                  "
                >
                  Đăng ký ngay
                </Link>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

interface LoginFeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function LoginFeatureCard({
  icon,
  title,
  description,
}: LoginFeatureCardProps) {
  return (
    <div
      className="
        rounded-[22px]
        border
        border-white/25
        bg-[#102033]/84
        p-5
        shadow-lg
        backdrop-blur-xl
        transition
        duration-300
        hover:-translate-y-1
        hover:bg-[#152A42]/94
      "
    >
      <div
        className="
          mb-4
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          border
          border-white/20
          bg-white/10
          text-sky-300
        "
      >
        <i
          className={`ph ${icon} text-[26px]`}
        />
      </div>

      <p
        className="
          text-[17px]
          font-extrabold
          text-white
        "
      >
        {title}
      </p>

      <p
        className="
          mt-2
          text-[13px]
          font-medium
          leading-6
          text-slate-200
        "
      >
        {description}
      </p>
    </div>
  );
}