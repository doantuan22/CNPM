import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyBookings } from '../features/bookings/hooks';
import { formatCurrencyVND } from '../lib/utils';
import { ApiError } from '../services/apiClient';

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'Đã xác nhận':
    case 'Thành công':
    case 'Hoàn tất':
      return 'status-confirmed';
    case 'Đã hủy':
      return 'status-cancelled';
    default:
      return 'status-pending'; // Chờ xác nhận, Chờ thanh toán
  }
}

function getStatusFilterTag(status: string) {
  switch (status) {
    case 'Đã xác nhận':
    case 'Thành công':
    case 'Hoàn tất':
      return 'completed';
    case 'Đã hủy':
      return 'cancelled';
    default:
      return 'upcoming'; 
  }
}

export default function BookingsPage() {
  const bookingsQuery = useMyBookings();
  const [activeTab, setActiveTab] = useState('all');

  const filteredBookings = bookingsQuery.data?.filter(b => {
    if (activeTab === 'all') return true;
    return getStatusFilterTag(b.TrangThai) === activeTab;
  });

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      <div className="page-header">
        <h1>Đặt phòng của tôi</h1>
      </div>

      <div className="pill-tabs mb-5">
        <button type="button" className={`pill-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>Tất cả</button>
        <button type="button" className={`pill-tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Sắp tới</button>
        <button type="button" className={`pill-tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>Hoàn tất</button>
        <button type="button" className={`pill-tab ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>Đã hủy</button>
      </div>

      {bookingsQuery.isLoading ? (
        <div className="flex justify-center py-16"><div className="spinner"></div></div>
      ) : bookingsQuery.isError ? (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {bookingsQuery.error instanceof ApiError ? bookingsQuery.error.message : 'Không thể tải danh sách đặt phòng'}
        </div>
      ) : !bookingsQuery.data || bookingsQuery.data.length === 0 ? (
        <div className="empty-state">
          <i className="ph-duotone ph-suitcase"></i>
          <div className="empty-state__title">Không có đặt phòng nào</div>
          <div className="empty-state__desc">Bạn chưa thực hiện đơn đặt phòng nào. Hãy khám phá danh sách khách sạn và lên kế hoạch cho chuyến đi tiếp theo!</div>
          <Link to="/hotels" className="btn btn-primary mt-4">Tìm kiếm khách sạn</Link>
        </div>
      ) : filteredBookings?.length === 0 ? (
         <div className="empty-state">
           <i className="ph-duotone ph-suitcase"></i>
           <div className="empty-state__title">Không có đặt phòng nào</div>
           <div className="empty-state__desc">Không tìm thấy đơn đặt phòng nào phù hợp với bộ lọc bạn đã chọn.</div>
         </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredBookings?.map((b) => (
            <div key={b.MaDatPhong} className="card card-hover flex flex-col sm:flex-row items-stretch sm:items-center p-5 gap-5">
              <div className="w-full sm:w-[110px] h-32 sm:h-[110px] rounded-md bg-surface-tertiary flex-none overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                  <i className="ph-duotone ph-image text-3xl"></i>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="text-[13px] font-semibold text-primary">Mã đơn: {b.MaXacNhanDatPhong}</span>
                  <span className={`status-badge ${getStatusBadgeClass(b.TrangThai)}`}>{b.TrangThai}</span>
                </div>
                <h3 className="text-base font-semibold text-heading truncate">{b.TenKhachSan}</h3>
                <div className="text-[13px] text-muted flex gap-x-4 gap-y-1 flex-wrap mt-1">
                  <span>Nhận: <strong className="text-heading">{b.NgayNhanPhong}</strong></span>
                  <span className="hidden sm:inline">•</span>
                  <span>Trả: <strong className="text-heading">{b.NgayTraPhong}</strong></span>
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-3 min-w-[140px]">
                <div className="text-lg font-bold text-primary">{formatCurrencyVND(b.TongTienThanhToan)}</div>
                <div className="flex gap-2">
                  <Link to={`/bookings/${b.MaDatPhong}`} className="btn btn-outline btn-sm">Chi tiết</Link>
                  {getStatusFilterTag(b.TrangThai) === 'completed' && (
                    <button className="btn btn-primary btn-sm">Đánh giá</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
