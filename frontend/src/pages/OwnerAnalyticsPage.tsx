import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BarList } from '../components/analytics/BarList';
import { useOwnerHotelAnalytics } from '../features/analytics/hooks';
import { formatCurrencyVND } from '../lib/utils';
import { ApiError } from '../services/apiClient';

const STATUS_BAR_COLOR: Record<string, string> = {
  'Đã xác nhận': 'bg-emerald-500',
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
    <div className="space-y-6">
      <Link to={`/owner/hotels/${hotelId}`} className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại quản lý khách sạn</span>
      </Link>

      <div className="page-header">
        <div>
          <h1>Tổng quan hoạt động kinh doanh</h1>
          <p className="page-header__desc">Theo dõi hiệu suất phòng, doanh thu và các đơn đặt phòng trong thời gian thực.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-white border border-border rounded-lg overflow-hidden">
            <input 
              type="date" 
              className="px-3 py-2 text-sm border-r border-border outline-none text-ink"
              value={fromInput}
              onChange={e => setFromInput(e.target.value)}
            />
            <input 
              type="date" 
              className="px-3 py-2 text-sm border-r border-border outline-none text-ink"
              value={toInput}
              onChange={e => setToInput(e.target.value)}
            />
            <button 
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-ink transition-colors"
              onClick={() => setAppliedRange({ from: fromInput || undefined, to: toInput || undefined })}
            >
              Lọc
            </button>
          </div>
        </div>
      </div>

      {analyticsQuery.isLoading ? (
        <div className="flex justify-center py-16" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span className="sr-only">Đang tải...</span></div>
      ) : analyticsQuery.isError || !analyticsQuery.data ? (
        <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {analyticsQuery.error instanceof ApiError ? analyticsQuery.error.message : 'Không thể tải thống kê'}
        </div>
      ) : (
        <>
          {/* KPI GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI 1 */}
            <div className="card p-5 border-t-4 border-t-blue-600">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-semibold text-muted">Doanh thu thực nhận</span>
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg"><i className="ph-fill ph-currency-circle-dollar"></i></div>
              </div>
              <div className="text-[24px] font-bold text-heading">{formatCurrencyVND(analyticsQuery.data.DoanhThuThucNhan)}</div>
            </div>

            {/* KPI 2 */}
            <div className="card p-5 border-t-4 border-t-emerald-500">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-semibold text-muted">Tổng số đơn booking</span>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg"><i className="ph-fill ph-clipboard-text"></i></div>
              </div>
              <div className="text-[24px] font-bold text-heading">{analyticsQuery.data.TongSoBooking.toLocaleString('vi-VN')} đơn</div>
            </div>

            {/* KPI 3 */}
            <div className="card p-5 border-t-4 border-t-amber-500">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-semibold text-muted">Tỷ lệ lấp đầy phòng</span>
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-lg"><i className="ph-fill ph-chart-bar"></i></div>
              </div>
              <div className="text-[24px] font-bold text-heading">
                {analyticsQuery.data.TyLeLapDay === null ? 'N/A' : `${analyticsQuery.data.TyLeLapDay}%`}
              </div>
              <div className="mt-1 text-[12px] text-muted truncate">
                {analyticsQuery.data.TongPhongDem.toLocaleString('vi-VN')} / {analyticsQuery.data.TongPhongCoTheBan.toLocaleString('vi-VN')} phòng-đêm
              </div>
            </div>

            {/* KPI 4 */}
            <div className="card p-5 border-t-4 border-t-red-500">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-semibold text-muted">Đã hoàn tiền</span>
                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-lg"><i className="ph-fill ph-arrow-u-up-left"></i></div>
              </div>
              <div className="text-[24px] font-bold text-heading">{formatCurrencyVND(analyticsQuery.data.TongHoanTien)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Biểu đồ trạng thái */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-border">
                <h2 className="text-base font-bold text-heading">Đặt phòng theo trạng thái</h2>
              </div>
              <BarList
                items={analyticsQuery.data.BookingTheoTrangThai.map((b) => ({
                  label: b.TrangThai,
                  value: b.SoLuong,
                  colorClass: STATUS_BAR_COLOR[b.TrangThai],
                }))}
                emptyMessage="Chưa có đặt phòng nào"
              />
            </div>

            {/* Biểu đồ loại phòng */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-border">
                <h2 className="text-base font-bold text-heading">Loại phòng phổ biến</h2>
              </div>
              <BarList
                items={analyticsQuery.data.LoaiPhongPhoBien.map((r) => ({ label: r.TenLoaiPhong, value: r.SoLuongDaDat }))}
                emptyMessage="Chưa có dữ liệu"
              />
            </div>
          </div>

        </>
      )}
    </div>
  );
}
