import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePromotionList } from '../features/promotions/hooks';
import { formatCurrencyVND } from '../lib/utils';
import { ApiError } from '../services/apiClient';

const PAGE_SIZE = 10;
const STATUSES = ['Hoạt động', 'Ngừng'];
const TYPES = ['Phần trăm', 'Số tiền cố định'];

export default function AdminPromotionsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  const query = usePromotionList({ page, limit: PAGE_SIZE, search: search || undefined, TrangThai: status || undefined, LoaiGiamGia: type || undefined });

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatus('');
    setType('');
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setSearch(val.trim());
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">Quản lý khuyến mãi</h1>
          <p className="text-sm text-slate-500 mt-0.5">Thiết lập các mã voucher chiết khấu, chiến dịch giảm giá toàn sàn.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/admin/promotions/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark shadow-sm transition">
            <i className="ph ph-plus text-lg"></i>
            <span>Tạo khuyến mãi mới</span>
          </Link>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[16px] border border-border shadow-sm space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 text-xs">
          <div className="md:col-span-5 relative">
            <label className="block font-semibold text-slate-600 mb-1.5">Tìm mã code / chương trình</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <i className="ph ph-magnifying-glass text-[16px]"></i>
              </div>
              <input 
                type="text" 
                value={searchInput} 
                onChange={(e) => handleSearchChange(e.target.value)} 
                placeholder="Nhập mã voucher..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-border rounded-xl text-sm text-heading placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block font-semibold text-slate-600 mb-1.5">Trạng thái áp dụng</label>
            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }} 
              className="w-full px-3 py-2.5 bg-slate-50 border border-border rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-medium"
            >
              <option value="">Tất cả trạng thái</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-600 mb-1.5">Loại giảm giá</label>
            <select 
              value={type} 
              onChange={(e) => { setType(e.target.value); setPage(1); }} 
              className="w-full px-3 py-2.5 bg-slate-50 border border-border rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-medium"
            >
              <option value="">Tất cả loại giảm</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button onClick={resetFilters} className="w-full py-2.5 px-3 border border-border rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition flex items-center justify-center gap-1.5">
              <i className="ph ph-arrow-counter-clockwise"></i> Đặt lại
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[16px] border border-border shadow-sm overflow-hidden flex flex-col">
        {query.isLoading ? (
          <div className="flex justify-center py-16"><div className="spinner"></div></div>
        ) : query.isError ? (
          <div role="alert" className="px-6 py-10 text-center text-sm text-red-700">
            {query.error instanceof ApiError ? query.error.message : 'Không thể tải danh sách khuyến mãi'}
          </div>
        ) : query.data && query.data.items.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <i className="ph ph-ticket text-[28px]"></i>
            </div>
            <h4 className="text-sm font-bold text-heading">Không tìm thấy mã khuyến mãi nào</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">Chưa có mã khuyến mãi nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Mã code</th>
                  <th className="py-3.5 px-4">Loại giảm</th>
                  <th className="py-3.5 px-4 text-right">Giá trị giảm</th>
                  <th className="py-3.5 px-4 text-center">Thời gian áp dụng</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {query.data?.items.map((p) => (
                  <tr key={p.MaKhuyenMai} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-mono font-bold text-primary-600 text-sm">{p.MaCode}</div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700">{p.LoaiGiamGia}</td>
                    <td className="py-4 px-4 text-right font-bold text-heading">
                      {p.LoaiGiamGia === 'Phần trăm' ? `${p.GiaTriGiam}%` : formatCurrencyVND(p.GiaTriGiam)}
                    </td>
                    <td className="py-4 px-4 text-center text-[11px] text-slate-500 font-mono">
                      {p.NgayBatDau} <br /> ↓ <br /> {p.NgayKetThuc}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        p.TrangThai === 'Hoạt động' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {p.TrangThai}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Link to={`/admin/promotions/${p.MaKhuyenMai}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 transition border border-primary-200/60">
                        Chi tiết
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
              Trang <strong className="text-heading">{query.data.pagination.page}</strong> / {query.data.pagination.totalPages} — Tổng <strong className="text-heading">{query.data.pagination.total}</strong> mã
            </div>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-medium transition"
              >
                Trước
              </button>
              <button
                disabled={page >= query.data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
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
