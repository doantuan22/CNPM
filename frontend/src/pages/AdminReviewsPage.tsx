import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminReviewList, useRemoveViolationReview } from '../features/reviews/hooks';
import { ApiError } from '../services/apiClient';

const PAGE_SIZE = 10;
const STATUSES = ['Chờ duyệt', 'Hiển thị', 'Ẩn', 'Vi phạm'];

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [star, setStar] = useState('');

  const query = useAdminReviewList({ page, limit: PAGE_SIZE, search: search || undefined, trangThai: status === 'ALL' ? undefined : status || undefined });
  const removeMutation = useRemoveViolationReview();

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setSearch(val.trim());
    setPage(1);
  };

  const renderStars = (score: number) => {
    const starsHTML = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= score) {
        starsHTML.push(<span key={i} className="text-amber-400">★</span>);
      } else {
        starsHTML.push(<span key={i} className="text-slate-300">★</span>);
      }
    }
    return <div className="flex items-center justify-center text-xs tracking-tighter">{starsHTML}</div>;
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">Kiểm duyệt đánh giá</h1>
          <p className="text-sm text-slate-500 mt-0.5">Rà soát phản hồi từ du khách, xử lý báo cáo vi phạm nội dung không chuẩn mực.</p>
        </div>
      </div>

      <div className="bg-white rounded-[16px] border border-border shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto">
            {['ALL', ...STATUSES].map((st) => (
              <button
                key={st}
                onClick={() => { setStatus(st); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs transition shadow-xs whitespace-nowrap ${
                  status === st || (st === 'ALL' && !status) 
                    ? (st === 'Vi phạm' ? 'font-bold bg-rose-50 text-rose-700 border border-rose-200' : 'font-bold bg-primary-50 text-primary-700 border border-primary-100')
                    : (st === 'Vi phạm' ? 'font-semibold text-rose-700 bg-rose-50/50 hover:bg-rose-100 border border-transparent' : 'font-semibold text-slate-600 hover:bg-slate-50 border border-transparent')
                }`}
              >
                {st === 'ALL' ? 'Tất cả đánh giá' : st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Hạng sao:</span>
            <select 
              value={star} 
              onChange={(e) => { setStar(e.target.value); setPage(1); }} 
              className="px-3 py-1.5 bg-slate-50 border border-border rounded-lg font-medium text-xs text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">Tất cả điểm sao</option>
              <option value="1">1 sao (Kém)</option>
              <option value="2">2 sao</option>
              <option value="3">3 sao</option>
              <option value="4">4 sao</option>
              <option value="5">5 sao (Tốt)</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <i className="ph ph-magnifying-glass text-[16px]"></i>
          </div>
          <input 
            type="text" 
            value={searchInput} 
            onChange={(e) => handleSearchChange(e.target.value)} 
            placeholder="Tìm kiếm đánh giá theo tên khách sạn, tên người dùng..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-border rounded-xl text-xs text-heading placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition"
          />
        </div>
      </div>

      {removeMutation.isError && (
        <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
          {removeMutation.error instanceof ApiError ? removeMutation.error.message : 'Không thể gỡ đánh giá'}
        </div>
      )}
      {removeMutation.isSuccess && (
        <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          Đánh giá đã được gỡ khỏi phần hiển thị công khai; dữ liệu lịch sử vẫn được lưu.
        </div>
      )}

      <div className="bg-white rounded-[16px] border border-border shadow-sm overflow-hidden flex flex-col">
        {query.isLoading ? (
          <div className="flex justify-center py-16"><div className="spinner"></div></div>
        ) : query.isError ? (
          <div role="alert" className="px-6 py-10 text-center text-sm text-red-700">
            {query.error instanceof ApiError ? query.error.message : 'Không thể tải danh sách đánh giá'}
          </div>
        ) : query.data && query.data.items.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <i className="ph ph-star text-[28px]"></i>
            </div>
            <h4 className="text-sm font-bold text-heading">Không tìm thấy đánh giá nào</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">Chưa có đánh giá nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center">Điểm sao</th>
                  <th className="py-3.5 px-4">Khách hàng</th>
                  <th className="py-3.5 px-4">Cơ sở khách sạn</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {query.data?.items
                  // Local filtering for star if selected
                  .filter(r => star === 'ALL' || star === '' || r.DiemDanhGia.toString() === star)
                  .map((r) => (
                  <tr key={r.MaDanhGia} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 text-center">
                      <div className="text-amber-500 font-bold text-sm tracking-wider">
                        {renderStars(r.DiemDanhGia)}
                        <div className="text-[10px] text-slate-400 mt-1">{r.DiemDanhGia}.0 / 5</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-heading">{r.TAI_KHOAN.HoTen}</div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700">
                      {r.KHACH_SAN.TenKhachSan}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        r.TrangThai === 'Hiển thị' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        r.TrangThai === 'Chờ duyệt' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        r.TrangThai === 'Vi phạm' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {r.TrangThai}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {r.TrangThai === 'Vi phạm' && (
                          <button
                            type="button"
                            disabled={removeMutation.isPending}
                            onClick={() => {
                              if (window.confirm('Gỡ đánh giá vi phạm khỏi phần hiển thị công khai? Dữ liệu và ảnh sẽ vẫn được lưu để phục vụ kiểm tra.')) {
                                removeMutation.mutate(r.MaDanhGia);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition border border-rose-200 disabled:opacity-50"
                          >
                            Xóa/gỡ
                          </button>
                        )}
                        <Link to={`/admin/reviews/${r.MaDanhGia}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 transition border border-primary-200/60">
                          Chi tiết
                        </Link>
                      </div>
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
              Trang <strong className="text-heading">{query.data.pagination.page}</strong> / {query.data.pagination.totalPages} — Tổng <strong className="text-heading">{query.data.pagination.total}</strong> đánh giá
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
