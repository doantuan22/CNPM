import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../features/auth/hooks';
import { registerSchema, RegisterFormValues } from '../features/auth/schemas';
import { ApiError } from '../services/apiClient';
import { cn } from '../lib/utils';
import { Button } from '../components/common/Button';

type RegisterIntent = 'customer' | 'partner' | null;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [intent, setIntent] = useState<RegisterIntent>(null);
  const [selectedIntent, setSelectedIntent] = useState<Exclude<RegisterIntent, null> | null>(null);
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
  
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  return (
    <div className="bg-surface-secondary min-h-[80vh] flex flex-col font-sans antialiased">
      <div className="page-container max-w-[760px] my-10 sm:my-16">
        
        {intent === null ? (
          <section id="step-role" className="animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-[28px] font-extrabold text-ink">Đăng ký tài khoản</h1>
              <p className="mt-2 text-ink-muted">Bạn muốn sử dụng nền tảng Egode với mục đích nào?</p>
            </div>

            <fieldset className="register-intent-list">
              <legend className="sr-only">Chọn mục đích đăng ký</legend>
              <label className={`register-intent ${selectedIntent === 'customer' ? 'is-selected' : ''}`}>
                <input type="radio" name="register-intent" value="customer" checked={selectedIntent === 'customer'} onChange={() => setSelectedIntent('customer')} />
                <span className="register-intent__content"><strong>Khách hàng</strong><span>Đặt phòng, quản lý chuyến đi, đánh giá khách sạn và gửi yêu cầu hỗ trợ.</span></span>
              </label>
              <label className={`register-intent ${selectedIntent === 'partner' ? 'is-selected' : ''}`}>
                <input type="radio" name="register-intent" value="partner" checked={selectedIntent === 'partner'} onChange={() => setSelectedIntent('partner')} />
                <span className="register-intent__content"><strong>Đối tác khách sạn</strong><span>Đăng chỗ nghỉ lên Egode và quản lý phòng, giá bán, hoạt động kinh doanh.</span></span>
              </label>
            </fieldset>
            <div className="register-intent__actions"><Button type="button" disabled={!selectedIntent} onClick={() => selectedIntent && setIntent(selectedIntent)}>Tiếp tục</Button></div>

            <p className="text-center text-sm mt-8 text-ink-muted">
              Đã có tài khoản? <Link to="/login" className="font-semibold text-primary">Đăng nhập</Link>
            </p>
          </section>
        ) : (
          <section id="step-customer-form" className="animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-8 pt-8 pb-2">
                <button 
                  type="button" 
                  onClick={() => setIntent(null)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink transition-colors mb-4 -ml-2 px-2 py-1 rounded-lg hover:bg-slate-50"
                >
                  <i className="ph ph-arrow-left"></i> Quay lại
                </button>
                <div className="text-center mb-2">
                  <h1 className="text-xl md:text-2xl font-extrabold text-ink">
                    Tạo tài khoản {intent === 'customer' ? 'khách hàng' : 'đối tác'}
                  </h1>
                  <p className="text-sm mt-1 text-ink-muted">
                    {intent === 'customer' 
                      ? 'Để trải nghiệm đặt phòng dễ dàng và nhận nhiều ưu đãi.' 
                      : 'Đăng ký tài khoản để bắt đầu đưa chỗ nghỉ của bạn lên Egode.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-8 pt-3 space-y-5" noValidate>
                {registerMutation.isError && (
                  <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                    {registerMutation.error instanceof ApiError
                      ? registerMutation.error.message
                      : 'Đăng ký thất bại, vui lòng thử lại'}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="register-HoTen" className="block text-xs font-semibold text-ink uppercase tracking-wide">
                      Họ tên<span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <i className="ph ph-user text-lg"></i>
                      </div>
                      <input id="register-HoTen" 
                        type="text" 
                        placeholder="Vd: Nguyễn Văn A"
                        className={cn("w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white text-ink text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all", errors.HoTen ? "border-rose-500 bg-rose-50/20" : "border-border")}
                        {...register('HoTen')}
                      />
                    </div>
                    {errors.HoTen && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><i className="ph-fill ph-warning-circle"></i>{errors.HoTen.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="register-field-1" className="block text-xs font-semibold text-ink uppercase tracking-wide">Ngày sinh</label>
                    <input id="register-field-1" 
                      type="date" 
                      className={cn("w-full px-3.5 py-2.5 rounded-xl border bg-white text-ink text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all", errors.NgaySinh ? "border-rose-500 bg-rose-50/20" : "border-border")}
                      {...register('NgaySinh')}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="register-TenDangNhap" className="block text-xs font-semibold text-ink uppercase tracking-wide">
                      Tên đăng nhập<span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <i className="ph ph-identification-card text-lg"></i>
                      </div>
                      <input id="register-TenDangNhap" 
                        type="text" 
                        placeholder="Vd: nguyenvana123"
                        className={cn("w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white text-ink text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all", errors.TenDangNhap ? "border-rose-500 bg-rose-50/20" : "border-border")}
                        {...register('TenDangNhap')}
                      />
                    </div>
                    {errors.TenDangNhap && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><i className="ph-fill ph-warning-circle"></i>{errors.TenDangNhap.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <p id="register-gender-label" className="block text-xs font-semibold text-ink uppercase tracking-wide">Giới tính</p>
                    <div role="radiogroup" aria-labelledby="register-gender-label" className="flex items-center gap-5 h-[42px]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="Nam" {...register('GioiTinh')} className="w-4 h-4 text-primary border-border focus:ring-primary accent-primary" />
                        <span className="text-sm font-medium text-ink">Nam</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="Nữ" {...register('GioiTinh')} className="w-4 h-4 text-primary border-border focus:ring-primary accent-primary" />
                        <span className="text-sm font-medium text-ink">Nữ</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="Khác" {...register('GioiTinh')} className="w-4 h-4 text-primary border-border focus:ring-primary accent-primary" />
                        <span className="text-sm font-medium text-ink">Khác</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="register-Email" className="block text-xs font-semibold text-ink uppercase tracking-wide">
                      Email<span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <i className="ph ph-envelope-simple text-lg"></i>
                      </div>
                      <input id="register-Email" 
                        type="email" 
                        placeholder="nguyenvana@gmail.com"
                        className={cn("w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white text-ink text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all", errors.Email ? "border-rose-500 bg-rose-50/20" : "border-border")}
                        {...register('Email')}
                      />
                    </div>
                    {errors.Email && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><i className="ph-fill ph-warning-circle"></i>{errors.Email.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="register-SoDienThoai" className="block text-xs font-semibold text-ink uppercase tracking-wide">
                      Số điện thoại<span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <i className="ph ph-phone text-lg"></i>
                      </div>
                      <input id="register-SoDienThoai" 
                        type="tel" 
                        placeholder="0901234567"
                        className={cn("w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-white text-ink text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all", errors.SoDienThoai ? "border-rose-500 bg-rose-50/20" : "border-border")}
                        {...register('SoDienThoai')}
                      />
                    </div>
                    {errors.SoDienThoai && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><i className="ph-fill ph-warning-circle"></i>{errors.SoDienThoai.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="register-MatKhau" className="block text-xs font-semibold text-ink uppercase tracking-wide">
                      Mật khẩu<span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <i className="ph ph-lock-simple text-lg"></i>
                      </div>
                      <input id="register-MatKhau" 
                        type={showPwd ? "text" : "password"} 
                        placeholder="Tối thiểu 8 ký tự"
                        className={cn("w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white text-ink text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all", errors.MatKhau ? "border-rose-500 bg-rose-50/20" : "border-border")}
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
                    {errors.MatKhau && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><i className="ph-fill ph-warning-circle"></i>{errors.MatKhau.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="register-confirmMatKhau" className="block text-xs font-semibold text-ink uppercase tracking-wide">
                      Xác nhận mật khẩu<span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <i className="ph ph-lock-key text-lg"></i>
                      </div>
                      <input id="register-confirmMatKhau" 
                        type={showConfirmPwd ? "text" : "password"} 
                        placeholder="Nhập lại mật khẩu"
                        className={cn("w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white text-ink text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all", errors.confirmMatKhau ? "border-rose-500 bg-rose-50/20" : "border-border")}
                        {...register('confirmMatKhau')}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-ink transition-colors focus:outline-none"
                      >
                        <i className={cn("ph text-lg", showConfirmPwd ? "ph-eye" : "ph-eye-slash")}></i>
                      </button>
                    </div>
                    {errors.confirmMatKhau && <p className="text-xs text-rose-500 font-medium flex items-center gap-1"><i className="ph-fill ph-warning-circle"></i>{errors.confirmMatKhau.message}</p>}
                  </div>
                </div>

                <label className="flex items-start gap-2 cursor-pointer mt-4 group">
                  <input type="checkbox" required className="mt-1 w-4 h-4 rounded text-primary border-border focus:ring-primary accent-primary flex-shrink-0" />
                  <span className="text-sm text-ink-muted group-hover:text-ink transition-colors">
                    Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật của Egode.
                  </span>
                </label>

                <button 
                  type="submit" 
                  disabled={isSubmitting || registerMutation.isPending}
                  className="w-full py-3 px-4 bg-primary hover:bg-primary-700 active:bg-primary-800 text-white font-semibold rounded-xl shadow-md transition-all duration-200 mt-6 disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isSubmitting || registerMutation.isPending ? (
                     <>Đang xử lý... <div className="spinner w-4 h-4 border-2 border-white/20 border-t-white" aria-hidden="true"></div></>
                  ) : (
                    'Đăng ký tài khoản'
                  )}
                </button>

                <p className="text-center text-sm mt-5 text-ink-muted">
                  Đã có tài khoản? <Link to="/login" className="font-semibold text-primary hover:underline">Đăng nhập</Link>
                </p>
              </form>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
