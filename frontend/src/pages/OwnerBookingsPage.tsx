import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useOwnerBookings, useMyHotel } from '../features/owner/hooks';
import { formatCurrencyVND } from '../lib/utils';


function getStatusBadge(status: string) {
  switch (status) {
    case 'Đã xác nhận':
    case 'Hoàn tất':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {status}
        </span>
      );
    case 'Chờ thanh toán':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          {status}
        </span>
      );
    case 'Đã hủy':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {status}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          {status}
        </span>
      );
  }
}

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
  
  const setFilter = (key: string, value: string) => { 
    const next = new URLSearchParams(params); 
    if (value) next.set(key, value); 
    else next.delete(key); 
    next.delete('page'); 
    setParams(next); 
  };

  const resetFilters = () => {
    setParams(new URLSearchParams());
  };

  if (hotelQuery.isLoading || query.isLoading) {
    return <div className="flex justify-center py-16"><div className="spinner"></div></div>;
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
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tìm kiếm booking</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <i className="ph ph-magnifying-glass"></i>
              </div>
              <input 
                type="text" 
                value={filters.search ?? ''} 
                onChange={(e) => setFilter('search', e.target.value)} 
                placeholder="Mã booking, tên khách..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Trạng thái đặt phòng</label>
            <select 
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
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Khoảng ngày Check-in</label>
            <div className="flex items-center gap-2">
              <input type="date" value={filters.from ?? ''} onChange={(e) => setFilter('from', e.target.value)} className="flex-1 w-full px-2.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
              <span className="text-slate-400 text-xs font-medium">→</span>
              <input type="date" value={filters.to ?? ''} onChange={(e) => setFilter('to', e.target.value)} className="flex-1 w-full px-2.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
            </div>
          </div>

          <div className="lg:col-span-1 flex items-end">
            <button onClick={resetFilters} title="Xóa bộ lọc" className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1 text-xs font-semibold transition">
              <i className="ph ph-arrow-counter-clockwise"></i> Đặt lại
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[16px] border border-border shadow-sm overflow-hidden flex flex-col">
        {result.items.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <i className="ph ph-calendar-x text-[32px]"></i>
            </div>
            <h4 className="text-base font-semibold text-slate-900">Không tìm thấy đặt phòng</h4>
            <p className="text-sm text-slate-500 max-w-sm mt-1">Thử thay đổi từ khóa hoặc xóa bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10 text-center"><i className="ph-fill ph-hash text-slate-400"></i></th>
                  <th className="py-3.5 px-4">Mã Booking</th>
                  <th className="py-3.5 px-4">Khách hàng</th>
                  <th className="py-3.5 px-4">Ngày nhận phòng</th>
                  <th className="py-3.5 px-4">Ngày trả phòng</th>
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
                      <div className="text-xs text-slate-500">{(b.KhachHang as any).SoDienThoai}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-800">{new Date(b.NgayNhanPhong).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-800">{new Date(b.NgayTraPhong).toLocaleDateString('vi-VN')}</div>
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
        )}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Tổng cộng {result.pagination.total} kết quả</span>
        </div>
      </div>
    </div>
  );
}
