import { useState } from 'react';
import { ArrowLeft, CalendarCheck, Wallet, RotateCcw, TrendingUp, BedDouble } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { StatTile } from '../components/analytics/StatTile';
import { BarList } from '../components/analytics/BarList';
import { DateRangeFilter } from '../components/analytics/DateRangeFilter';
import { useOwnerHotelAnalytics } from '../features/analytics/hooks';
import { formatCurrencyVND } from '../lib/utils';
import { ApiError } from '../services/apiClient';

const STATUS_BAR_COLOR: Record<string, string> = {
  'Đã xác nhận': 'bg-green-500',
  'Chờ thanh toán': 'bg-amber-500',
  'Đã hủy': 'bg-red-400',
  'Hoàn tất': 'bg-blue-500',
};

export default function OwnerAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const hotelId = Number(id);

  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [appliedRange, setAppliedRange] = useState<{ from?: string; to?: string }>({});

  const analyticsQuery = useOwnerHotelAnalytics(hotelId, appliedRange);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to={`/owner/hotels/${hotelId}`}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay lại quản lý khách sạn
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thống kê khách sạn</h1>
        <p className="text-sm text-slate-500">Số liệu đặt phòng, doanh thu và tỷ lệ lấp đầy — chỉ dữ liệu của khách sạn này</p>
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

      {analyticsQuery.isLoading ? (
        <div className="flex justify-center py-16" role="status" aria-live="polite">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      ) : analyticsQuery.isError || !analyticsQuery.data ? (
        <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {analyticsQuery.error instanceof ApiError ? analyticsQuery.error.message : 'Không thể tải thống kê'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile label="Tổng số đặt phòng" value={analyticsQuery.data.TongSoBooking.toLocaleString('vi-VN')} icon={<CalendarCheck className="h-4 w-4" />} />
            <StatTile label="Doanh thu gộp" value={formatCurrencyVND(analyticsQuery.data.DoanhThuGop)} icon={<Wallet className="h-4 w-4" />} />
            <StatTile label="Đã hoàn tiền" value={formatCurrencyVND(analyticsQuery.data.TongHoanTien)} icon={<RotateCcw className="h-4 w-4" />} tone={analyticsQuery.data.TongHoanTien > 0 ? 'negative' : 'default'} />
            <StatTile label="Doanh thu thực nhận" value={formatCurrencyVND(analyticsQuery.data.DoanhThuThucNhan)} icon={<TrendingUp className="h-4 w-4" />} tone="positive" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Đặt phòng theo trạng thái</h2>
              <BarList
                items={analyticsQuery.data.BookingTheoTrangThai.map((b) => ({
                  label: b.TrangThai,
                  value: b.SoLuong,
                  colorClass: STATUS_BAR_COLOR[b.TrangThai],
                }))}
                emptyMessage="Chưa có đặt phòng nào trong khoảng thời gian này"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <BedDouble className="h-4 w-4 text-slate-400" /> Loại phòng được đặt nhiều nhất
              </h2>
              <BarList
                items={analyticsQuery.data.LoaiPhongPhoBien.map((r) => ({ label: r.TenLoaiPhong, value: r.SoLuongDaDat }))}
                emptyMessage="Chưa có dữ liệu"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="mb-1 text-sm font-semibold text-slate-900">Tỷ lệ lấp đầy</h2>
            {analyticsQuery.data.TyLeLapDay === null ? (
              <p className="text-sm text-slate-500">Chưa có dữ liệu quỹ phòng/giá trong khoảng thời gian này để tính tỷ lệ lấp đầy.</p>
            ) : (
              <>
                <p className="text-3xl font-bold text-blue-700">{analyticsQuery.data.TyLeLapDay}%</p>
                <p className="mt-1 text-xs text-slate-500">
                  {analyticsQuery.data.TongPhongDem.toLocaleString('vi-VN')} phòng-đêm đã đặt / {analyticsQuery.data.TongPhongCoTheBan.toLocaleString('vi-VN')} phòng-đêm có thể bán
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
