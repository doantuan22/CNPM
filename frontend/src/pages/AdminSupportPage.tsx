import { Link } from 'react-router-dom';
import { useAdminSupportList } from '../features/support/hooks';
import { ApiError } from '../services/apiClient';
import { StatusBadge } from '../components/domain/StatusBadge';
import { useListParams, useUrlSearchInput } from '../hooks/useListParams';
import { Pagination } from '../components/common/Pagination';

const PAGE_SIZE = 10;
const STATUSES = ['Mới', 'Đang xử lý', 'Đã xử lý'];
const TYPES = ['Hỗ trợ', 'Khiếu nại'];

const FILTER_DEFAULTS = { search: '', status: '', type: '' };

export default function AdminSupportPage() {
  const { values, page, setValue, setPage } = useListParams(FILTER_DEFAULTS);
  const [searchInput, setSearchInput] = useUrlSearchInput(values.search, (value) => setValue('search', value));
  const search = values.search;
  const status = values.status;
  const setStatus = (value: string) => setValue('status', value);
  const type = values.type;
  const setType = (value: string) => setValue('type', value);

  const query = useAdminSupportList({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    trangThai: status === 'ALL' ? undefined : status || undefined,
    loaiYeuCau: type || undefined,
  });

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setPage(1);
  };

  return (
    <div className="admin-list-page flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">Hỗ trợ & Khiếu nại</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tiếp nhận yêu cầu trợ giúp, xử lý mâu thuẫn đặt phòng từ khách hàng và đối tác.</p>
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
                    ? 'font-bold bg-primary-50 text-primary-700 border border-primary-100'
                    : 'font-semibold text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {st === 'ALL' ? 'Tất cả ticket' : st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Phân loại:</span>
            <select 
              value={type} 
              onChange={(e) => { setType(e.target.value); setPage(1); }} 
              className="px-3 py-1.5 bg-slate-50 border border-border rounded-lg font-medium text-xs text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tất cả phân loại</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
            placeholder="Tìm mã ticket, tiêu đề hoặc khách hàng..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-border rounded-xl text-xs text-heading placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-[16px] border border-border shadow-sm overflow-hidden flex flex-col">
        {query.isLoading ? (
          <div className="flex justify-center py-16" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span className="sr-only">Đang tải...</span></div>
        ) : query.isError ? (
          <div role="alert" className="px-6 py-10 text-center text-sm text-red-700">
            {query.error instanceof ApiError ? query.error.message : 'Không thể tải danh sách yêu cầu'}
          </div>
        ) : query.data && query.data.items.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <i className="ph ph-chat-circle-dots text-[28px]"></i>
            </div>
            <h4 className="text-sm font-bold text-heading">Không tìm thấy yêu cầu nào</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">Chưa có ticket nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5 font-mono">Mã Ticket</th>
                  <th className="py-3.5 px-4">Khách hàng</th>
                  <th className="py-3.5 px-3 text-center">Phân loại</th>
                  <th className="py-3.5 px-6">Tiêu đề yêu cầu</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center">Xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {query.data?.items.map((r) => (
                  <tr key={r.MaYeuCauHoTro} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-mono font-bold text-primary-600 text-sm">#TCK-{r.MaYeuCauHoTro}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-heading">
                      {r.TAI_KHOAN_YEU_CAU_HO_TRO_MaTaiKhoanKhachHangToTAI_KHOAN.HoTen}
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        {r.LoaiYeuCau}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800">
                      {r.TieuDe}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge domain="support" status={r.TrangThai} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Link to={`/admin/support/${r.MaYeuCauHoTro}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 transition border border-primary-200/60">
                        Phản hồi
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {query.data && (
          <Pagination page={page} totalPages={query.data.pagination.totalPages} total={query.data.pagination.total} itemLabel="yêu cầu" onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
