import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useOwnerBookings, useMyHotel } from '../features/owner/hooks';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { formatCurrencyVND } from '../lib/utils';
import { StatusBadge } from '../components/domain/StatusBadge';


function getStatusBadge(status: string) { return <StatusBadge domain="booking" status={status} />; }

export default function OwnerBookingsPage() {
  const { id } = useParams<{ id: string }>(); 
  const hotelId = Number(id); 
  const [params, setParams] = useSearchParams();
  
  const filters = { 
    page: Number(params.get('page') ?? 1), 
    limit: 20, 
    trangThai: params.get('trangThai') ?? undefined, 
    search: params.get('search') ?? undefined, 
    from: params.get('from') ?? undefined, 
    to: params.get('to') ?? undefined 
  };
  
  const hotelQuery = useMyHotel(hotelId);
  const query = useOwnerBookings(hotelId, filters);

  // Filters live in the URL, but replace the entry so typing doesn't flood browser history.
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next, { replace: true });
  };
  const setPage = (page: number) => {
    const next = new URLSearchParams(params);
    if (page > 1) next.set('page', String(page));
    else next.delete('page');
    setParams(next);
  };

  // Local input + debounce: one request per pause instead of one per keystroke.
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const debouncedSearch = useDebouncedValue(searchInput.trim());
  useEffect(() => {
    if (debouncedSearch !== (params.get('search') ?? '')) setFilter('search', debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the settled input
  }, [debouncedSearch]);

  const resetFilters = () => {
    setSearchInput('');
    setParams(new URLSearchParams(), { replace: true });
  };

  // Only the first load replaces the page; later filter changes keep the previous rows visible.
  if (hotelQuery.isLoading || (query.isLoading && !query.data)) {
    return <div className="flex justify-center py-16" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span className="sr-only">Đang tải...</span></div>;
  }

  if (hotelQuery.isError || query.isError) {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700 border border-red-200">
        Lỗi tải dữ liệu. Vui lòng thử lại.
      </div>
    );
  }

  const hotel = hotelQuery.data!;
  const result = query.data!;

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
      <Link to={`/owner/hotels/${hotelId}`} className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại khách sạn</span>
      </Link>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
          <i className="ph-fill ph-buildings text-[20px]"></i>
        </div>
        <div className="relative">
          <span className="text-xs font-medium text-slate-500 block leading-tight">Đang quản lý cơ sở:</span>
          <span className="flex items-center gap-2 text-sm font-bold text-slate-900">{hotel.TenKhachSan}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Danh sách đặt phòng</h1>
            <span className="bg-primary-100 text-primary-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Partner</span>
          </div>
          <p className="text-sm text-slate-500">Theo dõi, kiểm tra chi tiết và tiếp đón khách hàng theo thời gian thực.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => query.refetch()} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition shadow-sm">
            <i className="ph ph-arrows-clockwise"></i> Làm mới
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[16px] border border-border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5">
          <div className="lg:col-span-4 relative">
            <label htmlFor="owner-bookings-field-1" className="block text-xs font-semibold text-slate-600 mb-1.5">Tìm kiếm booking</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <i className="ph ph-magnifying-glass"></i>
              </div>
              <input id="owner-bookings-field-1" 
                type="text" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Mã booking, tên khách..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <label htmlFor="owner-bookings-field-2" className="block text-xs font-semibold text-slate-600 mb-1.5">Trạng thái đặt phòng</label>
            <select id="owner-bookings-field-2" 
              value={filters.trangThai ?? ''} 
              onChange={(e) => setFilter('trangThai', e.target.value)} 
              className="w-full px-3 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-medium"
            >
              <option value="">Tất cả trạng thái</option>
              {['Chờ thanh toán', 'Đã xác nhận', 'Đã hủy', 'Hoàn tất'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-4">
            <p id="owner-bookings-range-label" className="block text-xs font-semibold text-slate-600 mb-1.5">Khoảng ngày Check-in</p>
            <div role="group" aria-labelledby="owner-bookings-range-label" className="flex items-center gap-2">
              <input type="date" aria-label="Nhận phòng từ ngày" value={filters.from ?? ''} onChange={(e) => setFilter('from', e.target.value)} className="flex-1 w-full px-2.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
              <span className="text-slate-400 text-xs font-medium">→</span>
              <input type="date" aria-label="Nhận phòng đến ngày" min={filters.from} value={filters.to ?? ''} onChange={(e) => setFilter('to', e.target.value)} className="flex-1 w-full px-2.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
            </div>
          </div>

          <div className="lg:col-span-1 flex items-end">
            <button onClick={resetFilters} title="Xóa bộ lọc" className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1 text-xs font-semibold transition">
              <i className="ph ph-arrow-counter-clockwise"></i> Đặt lại
            </button>
          </div>
        </div>
      </div>

      <div className="owner-bookings-results bg-white rounded-[16px] border border-border overflow-hidden flex flex-col">
        {result.items.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <i className="ph ph-calendar-x text-[32px]"></i>
            </div>
            <h4 className="text-base font-semibold text-slate-900">Không tìm thấy đặt phòng</h4>
            <p className="text-sm text-slate-500 max-w-sm mt-1">Thử thay đổi từ khóa hoặc xóa bộ lọc.</p>
          </div>
        ) : (
          <>
          <div className="owner-bookings-table hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10 text-center"><i className="ph-fill ph-hash text-slate-400"></i></th>
                  <th className="py-3.5 px-4">Mã Booking</th>
                  <th className="py-3.5 px-4">Khách hàng</th>
                  <th className="py-3.5 px-4">Ngày nhận phòng</th>
                  <th className="py-3.5 px-4">Ngày trả phòng</th>
                  <th className="py-3.5 px-4">Phòng</th>
                  <th className="py-3.5 px-4 text-right">Tổng tiền</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {result.items.map(b => (
                  <tr key={b.MaDatPhong} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 text-center text-xs text-slate-400 font-mono">{b.MaDatPhong}</td>
                    <td className="py-4 px-4 font-mono font-bold text-primary">{b.MaXacNhanDatPhong}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{b.KhachHang.HoTen}</div>
                      <div className="text-xs text-slate-500">{b.KhachHang.SoDienThoai}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-800">{new Date(b.NgayNhanPhong).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-800">{new Date(b.NgayTraPhong).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600">
                      {b.ChiTietPhong.map((room) => `${room.TenLoaiPhong} × ${room.SoLuong}`).join(', ')}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-extrabold text-slate-900">{formatCurrencyVND(b.TongTienThanhToan)}</div>
                      {b.TrangThai === 'Đã xác nhận' && <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">Đã thanh toán</span>}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(b.TrangThai)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Link to={`/owner/hotels/${hotelId}/bookings/${b.MaDatPhong}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 transition border border-primary-200/60">
                        <span>Chi tiết</span>
                        <i className="ph ph-caret-right"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="owner-bookings-mobile-list md:hidden divide-y divide-border">
            {result.items.map((booking) => (
              <article key={booking.MaDatPhong} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-bold text-primary break-all">{booking.MaXacNhanDatPhong}</p>
                    <p className="mt-1 font-semibold text-heading">{booking.KhachHang.HoTen}</p>
                    <p className="text-sm text-muted">{booking.KhachHang.SoDienThoai}</p>
                  </div>
                  {getStatusBadge(booking.TrangThai)}
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div><dt className="text-xs text-muted">Nhận phòng</dt><dd className="font-medium text-heading">{new Date(booking.NgayNhanPhong).toLocaleDateString('vi-VN')}</dd></div>
                  <div><dt className="text-xs text-muted">Trả phòng</dt><dd className="font-medium text-heading">{new Date(booking.NgayTraPhong).toLocaleDateString('vi-VN')}</dd></div>
                  <div className="col-span-2"><dt className="text-xs text-muted">Phòng</dt><dd className="font-medium text-heading">{booking.ChiTietPhong.map((room) => `${room.TenLoaiPhong} × ${room.SoLuong}`).join(', ')}</dd></div>
                  <div className="col-span-2"><dt className="text-xs text-muted">Tổng thanh toán</dt><dd className="font-bold text-heading">{formatCurrencyVND(booking.TongTienThanhToan)}</dd></div>
                </dl>
                <Link to={`/owner/hotels/${hotelId}/bookings/${booking.MaDatPhong}`} className="btn btn-outline btn-sm w-full justify-center">Xem chi tiết</Link>
              </article>
            ))}
          </div>
          </>
        )}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Tổng cộng {result.pagination.total} kết quả</span>
          {result.pagination.totalPages > 1 && (
            <nav aria-label="Phân trang đặt phòng" className="flex items-center gap-2">
              <button type="button" onClick={() => setPage(filters.page - 1)} disabled={filters.page <= 1} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition">Trước</button>
              <span aria-current="page">Trang {result.pagination.page}/{result.pagination.totalPages}</span>
              <button type="button" onClick={() => setPage(filters.page + 1)} disabled={filters.page >= result.pagination.totalPages} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition">Sau</button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
