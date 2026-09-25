import { Hotel, Search, ShieldCheck, Sparkles, Activity } from 'lucide-react';
import { useHealth } from '../hooks/useHealth';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { data: health, isLoading, isError } = useHealth();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-16 text-white shadow-xl sm:px-12 sm:py-24">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Nền tảng đặt phòng thế hệ mới</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Tìm nơi dừng chân lý tưởng cho mọi hành trình
          </h1>
          <p className="text-base text-blue-100 sm:text-lg">
            Khám phá hàng ngàn khách sạn, resort sang trọng với mức giá ưu đãi và dịch vụ đặt phòng
            minh bạch, nhanh chóng.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold" asChild>
              <Link to="/hotels">
                <Search className="mr-2 h-4 w-4" /> Khám phá khách sạn
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/register">Đăng ký thành viên</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* System Health / Foundation Status Indicator */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Trạng thái hệ thống (API Health)</h2>
              <p className="text-xs text-slate-500">
                Kiểm tra kết nối thời gian thực giữa Frontend (Vite) và Backend (Node.js/Express)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                Đang kết nối...
              </span>
            )}
            {isError && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                Không thể kết nối Backend
              </span>
            )}
            {health && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                Backend hoạt động tốt (v1.0.0)
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Platform Features Preview */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Hotel className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Đa dạng lựa chọn</h3>
          <p className="mt-2 text-sm text-slate-600">
            Hàng ngàn phòng khách sạn, homestay, biệt thự nghỉ dưỡng phù hợp với mọi ngân sách.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Thanh toán an toàn</h3>
          <p className="mt-2 text-sm text-slate-600">
            Tích hợp cổng thanh toán trực tuyến VNPAY với bảo mật đa tầng, xác thực tức thì.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Ưu đãi độc quyền</h3>
          <p className="mt-2 text-sm text-slate-600">
            Chính sách thành viên, tích lũy điểm thưởng và các mã giảm giá hấp dẫn hàng tuần.
          </p>
        </div>
      </section>
    </div>
  );
}
