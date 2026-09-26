import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../components/common/Button';
import { usePromotionList } from '../features/promotions/hooks';
import { promotionStatusBadgeClass } from '../features/promotions/status';
import { formatCurrencyVND, cn } from '../lib/utils';
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

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý khuyến mãi</h1>
          <p className="text-sm text-slate-500">Mã khuyến mãi áp dụng toàn hệ thống</p>
        </div>
        <Button asChild>
          <Link to="/admin/promotions/new">
            <Plus className="mr-1.5 h-4 w-4" /> Tạo mã mới
          </Link>
        </Button>
      </div>

      <form onSubmit={onSearchSubmit} className="flex flex-wrap gap-3">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm theo mã khuyến mãi..."
          className="min-w-64 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs">
          <option value="">Tất cả loại giảm</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs">
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Tìm kiếm
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {query.isLoading ? (
          <div className="flex justify-center py-16" role="status" aria-live="polite">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          </div>
        ) : query.isError ? (
          <div role="alert" className="px-6 py-10 text-center text-sm text-red-700">
            {query.error instanceof ApiError ? query.error.message : 'Không thể tải danh sách khuyến mãi'}
          </div>
        ) : query.data && query.data.items.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">Không tìm thấy mã khuyến mãi nào phù hợp</div>
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Mã</th>
                  <th className="px-4 py-3">Loại giảm</th>
                  <th className="px-4 py-3">Giá trị</th>
                  <th className="px-4 py-3">Hiệu lực</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {query.data?.items.map((p) => (
                  <tr key={p.MaKhuyenMai} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">{p.MaCode}</td>
                    <td className="px-4 py-3 text-slate-700">{p.LoaiGiamGia}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {p.LoaiGiamGia === 'Phần trăm' ? `${p.GiaTriGiam}%` : formatCurrencyVND(p.GiaTriGiam)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.NgayBatDau} → {p.NgayKetThuc}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', promotionStatusBadgeClass(p.TrangThai))}>
                        {p.TrangThai}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/promotions/${p.MaKhuyenMai}`} className="text-sm font-medium text-blue-600 hover:underline">
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {query.data && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
                <span>
                  Trang {query.data.pagination.page}/{query.data.pagination.totalPages} — tổng {query.data.pagination.total} mã
                </span>
                <div className="flex gap-2">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40">
                    Trước
                  </button>
                  <button type="button" disabled={page >= query.data.pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40">
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
