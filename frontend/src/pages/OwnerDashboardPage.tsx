import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useMyHotels } from '../features/owner/hooks';
import { ApiError } from '../services/apiClient';
import { StatusBadge } from '../components/domain/StatusBadge';
import { PageSpinner } from '../components/common/PageSpinner';

export default function OwnerDashboardPage({ mode }: { mode: 'overview' | 'hotels' }) {
  const isOverview = mode === 'overview';
  const hotelsQuery = useMyHotels();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const hotels = hotelsQuery.data || [];
  const activeCount = hotels.filter(h => h.TrangThai === 'Hoạt động').length;
  const pendingCount = hotels.filter(h => h.TrangThai === 'Chờ duyệt').length;
  const suspendedCount = hotels.filter(h => h.TrangThai === 'Đình chỉ').length;
  const visibleHotels = useMemo(() => (hotelsQuery.data ?? []).filter((hotel) => {
    const search = searchTerm.trim().toLocaleLowerCase('vi');
    const matchesSearch = !search || `${hotel.TenKhachSan} ${hotel.DiaChiChiTiet} ${hotel.DIA_PHUONG.TenThanhPho}`.toLocaleLowerCase('vi').includes(search);
    const matchesStatus = statusFilter === 'all' || hotel.TrangThai === statusFilter;
    return matchesSearch && matchesStatus;
  }), [hotelsQuery.data, searchTerm, statusFilter]);

  return (
    <div className="owner-dashboard space-y-6">
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>{isOverview ? 'Tổng quan' : 'Khách sạn của tôi'}</h1>
          <p className="page-header__desc">{isOverview ? 'Tổng quan tình trạng hoạt động và các cơ sở lưu trú của bạn.' : 'Tìm kiếm và quản lý hồ sơ, hình ảnh, tiện nghi và trạng thái khách sạn.'}</p>
        </div>
        <Link to="/owner/hotels/new" className="btn btn-primary">
          <i className="ph ph-plus"></i> Thêm khách sạn mới
        </Link>
      </div>

      {hotelsQuery.isLoading ? (
        <PageSpinner />
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
          {/* Overview uses only the real property states returned by the API. */}
          {isOverview && <div className="owner-status-summary grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4 flex justify-between items-center">
              <div>
                <span className="text-[13px] text-muted block mb-1">Đang hoạt động</span>
                <strong className="text-[20px] text-heading font-bold">{activeCount} cơ sở</strong>
              </div>
              <span className="owner-status-dot owner-status-dot--success" aria-hidden="true"></span>
            </div>
            <div className="card p-4 flex justify-between items-center">
              <div>
                <span className="text-[13px] text-muted block mb-1">Chờ hệ thống duyệt</span>
                <strong className="text-[20px] text-heading font-bold">{pendingCount} cơ sở</strong>
              </div>
              <span className="owner-status-dot owner-status-dot--warning" aria-hidden="true"></span>
            </div>
            <div className="card p-4 flex justify-between items-center">
              <div>
                <span className="text-[13px] text-muted block mb-1">Đình chỉ / Tạm ngưng</span>
                <strong className="text-[20px] text-heading font-bold">{suspendedCount} cơ sở</strong>
              </div>
              <span className="owner-status-dot owner-status-dot--danger" aria-hidden="true"></span>
            </div>
          </div>}

          {!isOverview && <div className="owner-dashboard__filters flex justify-between items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-[420px] min-w-[220px]">
              <i className="ph ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
              <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="input !pl-10" placeholder="Tìm theo tên khách sạn, địa chỉ..." aria-label="Tìm khách sạn theo tên hoặc địa chỉ" />
            </div>

            <div className="flex gap-2 flex-wrap" role="group" aria-label="Lọc theo trạng thái khách sạn">
              <button type="button" aria-pressed={statusFilter === 'all'} onClick={() => setStatusFilter('all')} className={`pill-tab ${statusFilter === 'all' ? 'active' : ''}`}>Tất cả ({hotels.length})</button>
              <button type="button" aria-pressed={statusFilter === 'Hoạt động'} onClick={() => setStatusFilter('Hoạt động')} className={`pill-tab ${statusFilter === 'Hoạt động' ? 'active' : ''}`}>Hoạt động ({activeCount})</button>
              <button type="button" aria-pressed={statusFilter === 'Chờ duyệt'} onClick={() => setStatusFilter('Chờ duyệt')} className={`pill-tab ${statusFilter === 'Chờ duyệt' ? 'active' : ''}`}>Chờ duyệt ({pendingCount})</button>
              {suspendedCount > 0 && <button type="button" aria-pressed={statusFilter === 'Đình chỉ'} onClick={() => setStatusFilter('Đình chỉ')} className={`pill-tab ${statusFilter === 'Đình chỉ' ? 'active' : ''}`}>Đình chỉ ({suspendedCount})</button>}
            </div>
          </div>}

          {isOverview && <h2 className="text-base font-semibold text-heading">Cơ sở lưu trú của bạn</h2>}
          {/* Property identity and current state stay together as the owner context. */}
          <div className="owner-hotel-list flex flex-col">
            {visibleHotels.map((hotel) => (
              <article key={hotel.MaKhachSan} className="owner-hotel-list__item flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                
                <div className="relative w-full md:w-[156px] h-[118px] rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                  {hotel.HINH_ANH_KHACH_SAN[0] ? (
                    <img src={hotel.HINH_ANH_KHACH_SAN[0].URL} alt={hotel.TenKhachSan} className="w-full h-full object-cover" />
                  ) : (
                    <span className="owner-hotel-image-fallback">Ảnh khách sạn</span>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-[17px] font-bold text-heading">{hotel.TenKhachSan}</h3>
                    <span className="text-amber-500 text-[13px] tracking-widest">
                      {'★'.repeat(hotel.HangSao)}{'☆'.repeat(5 - hotel.HangSao)}
                    </span>
                    <StatusBadge domain="hotel" status={hotel.TrangThai} />
                  </div>

                  <div className="flex items-center gap-1.5 text-[13px] text-muted">
                    <i className="ph ph-map-pin"></i>
                    <span>{hotel.DIA_PHUONG.TenThanhPho}</span>
                  </div>

                  <div className="flex gap-7 flex-wrap pt-2.5 mt-1 border-t border-dashed border-border">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] text-muted">Phòng</span>
                      <strong className="text-[14px] font-semibold text-heading">{hotel._count?.LOAI_PHONG ?? 0} loại</strong>
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
                      Quản lý khách sạn
                    </Link>
                  )}
                  {hotel.TrangThai === 'Chờ duyệt' && (
                    <Link to={`/owner/hotels/${hotel.MaKhachSan}`} className="btn btn-secondary btn-sm flex justify-center py-2">
                      Xem chi tiết hồ sơ
                    </Link>
                  )}
                  {/* Additional actions can be placed here if needed */}
                </div>
              </article>
            ))}
            {visibleHotels.length === 0 && <p className="py-8 text-sm text-muted">{hotels.length === 0 ? 'Bạn chưa có khách sạn nào.' : 'Không tìm thấy khách sạn phù hợp với bộ lọc.'}</p>}
          </div>
        </>
      )}
    </div>
  );
}
