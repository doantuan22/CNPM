import { useState } from 'react';
import { Users, Hotel, CalendarCheck, Wallet, RotateCcw, TrendingUp, Star, LifeBuoy } from 'lucide-react';
import { StatTile } from '../components/analytics/StatTile';
import { BarList } from '../components/analytics/BarList';
import { DateRangeFilter } from '../components/analytics/DateRangeFilter';
import { useAdminAnalytics } from '../features/analytics/hooks';
import { formatCurrencyVND } from '../lib/utils';
import { ApiError } from '../services/apiClient';

export default function AdminAnalyticsPage() {
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [appliedRange, setAppliedRange] = useState<{ from?: string; to?: string }>({});

  const analyticsQuery = useAdminAnalytics(appliedRange);
  const data = analyticsQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Báo cáo &amp; thống kê hệ thống</h1>
        <p className="text-sm text-slate-500">Tổng quan toàn hệ thống — số liệu tài chính chỉ tính giao dịch/hoàn tiền đã thành công</p>
      </div>

      <DateRangeFilter
        from={fromInput}
        to={toInput}
        onFromChange={setFromInput}
        onToChange={setToInput}
        onApply={() => setAppliedRange({ from: fromInput || undefined, to: toInput || undefined })}
        onClear={() => {
          setFromInput('');
          setToInput('');
          setAppliedRange({});
        }}
      />
      <p className="text-xs text-slate-500">
        Khoảng thời gian áp dụng cho booking, thanh toán, hoàn tiền và yêu cầu hỗ trợ. Tổng tài khoản/khách sạn/đánh giá luôn là số liệu toàn thời gian
        (không có mốc ngày tạo trong dữ liệu hiện có cho đánh giá).
      </p>

      {analyticsQuery.isLoading ? (
        <div className="flex justify-center py-16" role="status" aria-live="polite">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      ) : analyticsQuery.isError || !data ? (
        <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {analyticsQuery.error instanceof ApiError ? analyticsQuery.error.message : 'Không thể tải thống kê'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile label="Tổng tài khoản" value={data.TongTaiKhoan.toLocaleString('vi-VN')} icon={<Users className="h-4 w-4" />} />
            <StatTile label="Tổng khách sạn" value={data.TongKhachSan.toLocaleString('vi-VN')} icon={<Hotel className="h-4 w-4" />} />
            <StatTile label="Tổng đặt phòng" value={data.TongSoBooking.toLocaleString('vi-VN')} icon={<CalendarCheck className="h-4 w-4" />} />
            <StatTile label="Tổng giao dịch" value={data.TongGiaoDich.toLocaleString('vi-VN')} icon={<Wallet className="h-4 w-4" />} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile label="Doanh thu hệ thống" value={formatCurrencyVND(data.DoanhThuHeThong)} icon={<Wallet className="h-4 w-4" />} />
            <StatTile label="Đã hoàn tiền" value={formatCurrencyVND(data.TongHoanTien)} icon={<RotateCcw className="h-4 w-4" />} tone={data.TongHoanTien > 0 ? 'negative' : 'default'} />
            <StatTile label="Doanh thu thực nhận" value={formatCurrencyVND(data.DoanhThuThucNhan)} icon={<TrendingUp className="h-4 w-4" />} tone="positive" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Tài khoản theo vai trò</h2>
              <BarList items={data.TaiKhoanTheoVaiTro.map((r) => ({ label: r.Label, value: r.SoLuong }))} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Khách sạn theo trạng thái</h2>
              <BarList items={data.KhachSanTheoTrangThai.map((r) => ({ label: r.Label, value: r.SoLuong }))} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Đặt phòng theo trạng thái</h2>
              <BarList items={data.BookingTheoTrangThai.map((r) => ({ label: r.TrangThai, value: r.SoLuong }))} emptyMessage="Chưa có đặt phòng nào trong khoảng thời gian này" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Thanh toán theo trạng thái</h2>
              <BarList items={data.ThanhToanTheoTrangThai.map((r) => ({ label: r.Label, value: r.SoLuong }))} emptyMessage="Chưa có giao dịch nào trong khoảng thời gian này" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Hoàn tiền theo trạng thái</h2>
              <BarList items={data.HoanTienTheoTrangThai.map((r) => ({ label: r.Label, value: r.SoLuong }))} emptyMessage="Chưa có yêu cầu hoàn tiền nào" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <Star className="h-4 w-4 text-slate-400" /> Đánh giá theo trạng thái (toàn thời gian)
              </h2>
              <BarList items={data.DanhGiaTheoTrangThai.map((r) => ({ label: r.Label, value: r.SoLuong }))} emptyMessage="Chưa có đánh giá nào" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:col-span-2">
              <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <LifeBuoy className="h-4 w-4 text-slate-400" /> Yêu cầu hỗ trợ/khiếu nại theo trạng thái
              </h2>
              <BarList items={data.YeuCauHoTroTheoTrangThai.map((r) => ({ label: r.Label, value: r.SoLuong }))} emptyMessage="Chưa có yêu cầu nào trong khoảng thời gian này" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
