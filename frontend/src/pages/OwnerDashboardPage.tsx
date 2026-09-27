import { Link } from 'react-router-dom';
import { useMyHotels } from '../features/owner/hooks';
import { ApiError } from '../services/apiClient';
function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'Hoạt động':
      return 'status-active';
    case 'Chờ duyệt':
      return 'status-pending';
    case 'Đình chỉ':
      return 'status-suspended';
    default:
      return 'status-pending';
  }
}

export default function OwnerDashboardPage() {
  const hotelsQuery = useMyHotels();

  const hotels = hotelsQuery.data || [];
  const activeCount = hotels.filter(h => h.TrangThai === 'Hoạt động').length;
  const pendingCount = hotels.filter(h => h.TrangThai === 'Chờ duyệt').length;
  const suspendedCount = hotels.filter(h => h.TrangThai === 'Đình chỉ').length;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Khách sạn của tôi</h1>
          <p className="page-header__desc">Quản lý hồ sơ, cấu hình phòng và theo dõi tình trạng phê duyệt của các cơ sở lưu trú.</p>
        </div>
        <Link to="/owner/hotels/new" className="btn btn-primary">
          <i className="ph ph-plus"></i> Thêm khách sạn mới
        </Link>
      </div>

      {hotelsQuery.isLoading ? (
        <div className="flex justify-center py-16"><div className="spinner"></div></div>
      ) : hotelsQuery.isError ? (
        <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {hotelsQuery.error instanceof ApiError ? hotelsQuery.error.message : 'Không thể tải danh sách khách sạn'}
        </div>
      ) : hotels.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-primary text-2xl mb-4">
            <i className="ph-duotone ph-buildings"></i>
          </div>
          <h2 className="text-lg font-semibold text-heading mb-2">Bạn chưa có khách sạn nào</h2>
          <p className="mx-auto max-w-md text-sm text-muted mb-5">
            Đăng ký khách sạn đầu tiên để bắt đầu kinh doanh trên nền tảng Egode.
          </p>
          <Link to="/owner/hotels/new" className="btn btn-primary">
            <i className="ph ph-plus"></i> Đăng ký khách sạn
          </Link>
        </div>
      ) : (
        <>
          {/* Mini Summary Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4 flex justify-between items-center">
              <div>
                <span className="text-[13px] text-muted block mb-1">Đang hoạt động</span>
                <strong className="text-[20px] text-heading font-bold">{activeCount} cơ sở</strong>
              </div>
              <div className="text-[22px]">🟢</div>
            </div>
            <div className="card p-4 flex justify-between items-center">
              <div>
                <span className="text-[13px] text-muted block mb-1">Chờ hệ thống duyệt</span>
                <strong className="text-[20px] text-heading font-bold">{pendingCount} cơ sở</strong>
              </div>
              <div className="text-[22px]">🟡</div>
            </div>
            <div className="card p-4 flex justify-between items-center">
              <div>
                <span className="text-[13px] text-muted block mb-1">Đình chỉ / Tạm ngưng</span>
                <strong className="text-[20px] text-heading font-bold">{suspendedCount} cơ sở</strong>
              </div>
              <div className="text-[22px]">🔴</div>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="card p-3.5 px-5 flex justify-between items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-[420px] min-w-[220px]">
              <i className="ph ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
              <input type="text" className="input !pl-10" placeholder="Tìm theo tên khách sạn, địa chỉ..." />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button className="pill-tab active">Tất cả ({hotels.length})</button>
              <button className="pill-tab">Hoạt động ({activeCount})</button>
              <button className="pill-tab">Chờ duyệt ({pendingCount})</button>
            </div>
          </div>

          {/* HOTEL CARDS LIST */}
          <div className="flex flex-col gap-4">
            {hotels.map((hotel) => (
              <div key={hotel.MaKhachSan} className="card p-6 flex flex-col md:flex-row gap-6 items-stretch md:items-center hover:shadow-md hover:border-blue-200 transition-all">
                
                <div className="relative w-full md:w-[190px] h-[130px] rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                  {hotel.HINH_ANH_KHACH_SAN[0] ? (
                    <img src={hotel.HINH_ANH_KHACH_SAN[0].URL} alt={hotel.TenKhachSan} className="w-full h-full object-cover" />
                  ) : (
                    <i className="ph-duotone ph-buildings text-4xl text-slate-300"></i>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-[18px] font-bold text-heading">{hotel.TenKhachSan}</h2>
                    <span className="text-amber-500 text-[13px] tracking-widest">
                      {'★'.repeat(hotel.HangSao)}{'☆'.repeat(5 - hotel.HangSao)}
                    </span>
                    <span className={`status-badge ${getStatusBadgeClass(hotel.TrangThai)}`}>{hotel.TrangThai}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[13px] text-muted">
                    <i className="ph ph-map-pin"></i>
                    <span>{hotel.DIA_PHUONG.TenThanhPho}</span>
                  </div>

                  <div className="flex gap-7 flex-wrap pt-2.5 mt-1 border-t border-dashed border-border">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] text-muted">Phòng</span>
                      <strong className="text-[14px] font-semibold text-heading">{(hotel as any).LOAI_PHONG_COUNT || 0} loại</strong>
                    </div>
                    {hotel.TrangThai === 'Chờ duyệt' && (
                      <>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[12px] text-muted">Trạng thái</span>
                          <strong className="text-[14px] font-semibold text-amber-600">Đang chờ xử lý</strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[160px] flex-shrink-0">
                  {hotel.TrangThai === 'Hoạt động' && (
                    <Link to={`/owner/hotels/${hotel.MaKhachSan}`} className="btn btn-primary btn-sm flex justify-center py-2">
                      Quản lý & Quỹ phòng
                    </Link>
                  )}
                  {hotel.TrangThai === 'Chờ duyệt' && (
                    <Link to={`/owner/hotels/${hotel.MaKhachSan}`} className="btn btn-secondary btn-sm flex justify-center py-2">
                      Xem chi tiết hồ sơ
                    </Link>
                  )}
                  {/* Additional actions can be placed here if needed */}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
