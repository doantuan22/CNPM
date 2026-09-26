import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminReviewList } from '../features/reviews/hooks';
import { reviewStatusBadgeClass } from '../features/reviews/status';
import { cn } from '../lib/utils';
import { ApiError } from '../services/apiClient';

const PAGE_SIZE = 10;
const STATUSES = ['Chờ duyệt', 'Hiển thị', 'Ẩn', 'Vi phạm'];

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const query = useAdminReviewList({ page, limit: PAGE_SIZE, search: search || undefined, trangThai: status || undefined });

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kiểm duyệt đánh giá</h1>
        <p className="text-sm text-slate-500">Duyệt, ẩn hoặc đánh dấu vi phạm cho đánh giá của khách hàng</p>
      </div>

      <form onSubmit={onSearchSubmit} className="flex flex-wrap gap-3">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm theo nội dung, khách hàng, khách sạn..."
          className="min-w-64 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
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
            {query.error instanceof ApiError ? query.error.message : 'Không thể tải danh sách đánh giá'}
          </div>
        ) : query.data && query.data.items.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">Không tìm thấy đánh giá nào phù hợp</div>
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Khách sạn</th>
                  <th className="px-4 py-3">Điểm</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {query.data?.items.map((r) => (
                  <tr key={r.MaDanhGia} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.TAI_KHOAN.HoTen}</td>
                    <td className="px-4 py-3 text-slate-700">{r.KHACH_SAN.TenKhachSan}</td>
                    <td className="px-4 py-3 text-slate-700">{r.DiemDanhGia} / 5</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', reviewStatusBadgeClass(r.TrangThai))}>
                        {r.TrangThai}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/reviews/${r.MaDanhGia}`} className="text-sm font-medium text-blue-600 hover:underline">
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
                  Trang {query.data.pagination.page}/{query.data.pagination.totalPages} — tổng {query.data.pagination.total} đánh giá
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
