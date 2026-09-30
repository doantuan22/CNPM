import { Link } from 'react-router-dom';
import { useAccountList } from '../features/admin/accounts/hooks';
import { ApiError } from '../services/apiClient';
import { StatusBadge } from '../components/domain/StatusBadge';
import { useListParams, useUrlSearchInput } from '../hooks/useListParams';
import { Pagination } from '../components/common/Pagination';
import { PageSpinner } from '../components/common/PageSpinner';

const PAGE_SIZE = 10;

const FILTER_DEFAULTS = { search: '', status: '' };

export default function AdminAccountsPage() {
  const { values, page, setValue, setPage, reset } = useListParams(FILTER_DEFAULTS);
  const [searchInput, setSearchInput] = useUrlSearchInput(values.search, (value) => setValue('search', value));
  const search = values.search;
  const status = values.status;
  const setStatus = (value: string) => setValue('status', value);

  const query = useAccountList({ page, limit: PAGE_SIZE, search: search || undefined, TrangThai: status || undefined });

  const resetFilters = () => reset();

  return (
    <div className="admin-list-page flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">Quản lý tài khoản</h1>
          <p className="text-sm text-slate-500 mt-0.5">Giám sát phân quyền, xác thực danh tính, trạng thái hoạt động và cấu hình người dùng trên toàn hệ thống.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/admin/accounts/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark shadow-sm transition">
            <i className="ph ph-plus text-[16px]"></i>
            <span>Thêm tài khoản</span>
          </Link>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[16px] border border-border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5">
          <div className="lg:col-span-6 relative">
            <label htmlFor="admin-accounts-field-1" className="block text-xs font-semibold text-slate-600 mb-1.5">Tìm kiếm tài khoản</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <i className="ph ph-magnifying-glass"></i>
              </div>
              <input id="admin-accounts-field-1" 
                type="text" 
                value={searchInput} 
                onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
                placeholder="Nhập họ tên, email, tên đăng nhập..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border border-border rounded-xl text-sm text-heading placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          </div>

          <div className="lg:col-span-4">
            <label htmlFor="admin-accounts-field-2" className="block text-xs font-semibold text-slate-600 mb-1.5">Trạng thái hoạt động</label>
              <select id="admin-accounts-field-2"
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }} 
              className="w-full px-3 py-2.5 bg-slate-50/60 border border-border rounded-xl text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-medium"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Hoạt động">Đang hoạt động</option>
              <option value="Khóa">Đang bị khóa</option>
            </select>
          </div>

        </div>
        {(search || status) && <div className="admin-active-filters" aria-label="Bộ lọc đang dùng">
          {search && <button type="button" onClick={() => { setSearchInput(''); setPage(1); }}>Tìm kiếm: {search} <span aria-hidden="true">×</span></button>}
          {status && <button type="button" onClick={() => { setStatus(''); setPage(1); }}>Trạng thái: {status} <span aria-hidden="true">×</span></button>}
          <button type="button" className="admin-active-filters__clear" onClick={resetFilters}>Xóa bộ lọc</button>
        </div>}
      </div>

      <div className="bg-white rounded-[16px] border border-border shadow-sm overflow-hidden flex flex-col">
        {query.isLoading ? (
          <PageSpinner />
        ) : query.isError ? (
          <div role="alert" className="px-6 py-10 text-center text-sm text-red-700">
            {query.error instanceof ApiError ? query.error.message : 'Không thể tải danh sách tài khoản'}
          </div>
        ) : query.data && query.data.items.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <i className="ph ph-users text-[32px]"></i>
            </div>
            <h4 className="text-sm font-bold text-heading">Không tìm thấy tài khoản nào phù hợp</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc làm mới bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-20">ID</th>
                  <th className="py-3.5 px-4">Tên đăng nhập</th>
                  <th className="py-3.5 px-5">Họ tên & Email</th>
                  <th className="py-3.5 px-4 text-center">Vai trò</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
              <th className="py-3.5 px-4 text-center">Hồ sơ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {query.data?.items.map((account) => (
                  <tr key={account.MaTaiKhoan} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">#{account.MaTaiKhoan}</td>
                    <td className="py-3.5 px-4 font-semibold text-heading">{account.TenDangNhap}</td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-heading">{account.HoTen}</div>
                      <div className="text-[11px] text-slate-400">{account.Email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs text-slate-600">
                        {account.VAI_TRO?.TenVaiTro ?? '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge domain="account" status={account.TrangThai} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link to={`/admin/accounts/${account.MaTaiKhoan}`} className="admin-row-link">
                        <span>Mở hồ sơ</span>
                        <i className="ph ph-arrow-up-right" aria-hidden="true"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {query.data && (
          <Pagination page={page} totalPages={query.data.pagination.totalPages} total={query.data.pagination.total} itemLabel="tài khoản" onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
