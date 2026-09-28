import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { ApiError } from '../services/apiClient';
import { StatusBadge } from '../components/domain/StatusBadge';
import { listAdminHotels } from '../features/admin/hotels/api';

export default function AdminHotelsPage() {
  const [page, setPage] = useState(1); 
  const [search, setSearch] = useState(''); 
  const debouncedSearch = useDebouncedValue(search.trim());
  const [status, setStatus] = useState('');
  
  const query = useQuery({ 
    queryKey: ['admin', 'hotels', page, debouncedSearch, status], 
    queryFn: () => listAdminHotels({ page, limit: 20, search: debouncedSearch || undefined, TrangThai: status || undefined }) 
  });
  
  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setPage(1);
  };

  return (
    <div className="admin-list-page flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">Quản lý khách sạn</h1>
          <p className="text-sm text-slate-500 mt-0.5">Giám sát toàn bộ cơ sở lưu trú đối tác, trạng thái mở bán và xử lý rủi ro.</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[16px] border border-border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-6 relative">
            <label htmlFor="admin-hotels-field-1" className="block text-xs font-semibold text-slate-600 mb-1.5">Tìm kiếm khách sạn</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <i className="ph ph-magnifying-glass"></i>
              </div>
              <input id="admin-hotels-field-1" 
                type="text" 
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
                placeholder="Nhập tên khách sạn..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-border rounded-xl text-sm text-heading placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label htmlFor="admin-hotels-field-2" className="block text-xs font-semibold text-slate-600 mb-1.5">Trạng thái hoạt động</label>
            <select id="admin-hotels-field-2" 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }} 
              className="w-full px-3 py-2.5 bg-slate-50/60 border border-border rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-medium"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Hoạt động">Đang hoạt động</option>
              <option value="Đình chỉ">Đình chỉ</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button onClick={resetFilters} title="Đặt lại bộ lọc" className="w-full py-2.5 px-3 border border-border rounded-xl text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1.5 text-xs font-semibold transition">
              <i className="ph ph-arrow-counter-clockwise"></i> Đặt lại
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[16px] border border-border shadow-sm overflow-hidden flex flex-col">
        {query.isLoading ? (
          <div className="flex justify-center py-16" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span className="sr-only">Đang tải...</span></div>
        ) : query.isError ? (
          <div role="alert" className="px-6 py-10 text-center text-sm text-red-700">
            {query.error instanceof ApiError ? query.error.message : 'Không thể tải khách sạn'}
          </div>
        ) : query.data && query.data.items.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <i className="ph ph-buildings text-[28px]"></i>
            </div>
            <h4 className="text-sm font-bold text-heading">Không tìm thấy khách sạn phù hợp</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">Vui lòng kiểm tra lại từ khóa hoặc xóa bớt tiêu chí lọc trạng thái.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tên cơ sở khách sạn</th>
                  <th className="py-3.5 px-4">Địa phương</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {query.data?.items.map((hotel) => (
                  <tr key={hotel.MaKhachSan} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-heading">{hotel.TenKhachSan}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">#{hotel.MaKhachSan}</div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700">
                      {hotel.DIA_PHUONG?.TenThanhPho ?? '—'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge domain="hotel" status={hotel.TrangThai} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Link to={`/admin/hotels/${hotel.MaKhachSan}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 transition border border-primary-200/60">
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

        {query.data && (
          <div className="px-6 py-4 border-t border-border bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Trang <strong className="text-heading">{query.data.pagination.page}</strong> / {query.data.pagination.totalPages} — Tổng <strong className="text-heading">{query.data.pagination.total}</strong> khách sạn
            </div>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-medium transition"
              >
                Trước
              </button>
              <button
                disabled={page >= query.data.pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-medium transition"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
