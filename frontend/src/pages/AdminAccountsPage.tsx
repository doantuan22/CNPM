import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccountList } from '../features/admin/accounts/hooks';
import { ApiError } from '../services/apiClient';

const PAGE_SIZE = 10;

export default function AdminAccountsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const query = useAccountList({ page, limit: PAGE_SIZE, search: search || undefined, TrangThai: status || undefined });

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý tài khoản</h1>
        <p className="text-sm text-slate-500">Tìm kiếm, xem chi tiết, khóa/mở khóa tài khoản người dùng</p>
      </div>

      <form onSubmit={onSearchSubmit} className="flex flex-wrap gap-3">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm theo tên đăng nhập, email, họ tên..."
          className="min-w-64 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Hoạt động">Hoạt động</option>
          <option value="Khóa">Khóa</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
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
            {query.error instanceof ApiError ? query.error.message : 'Không thể tải danh sách tài khoản'}
          </div>
        ) : query.data && query.data.items.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            Không tìm thấy tài khoản nào phù hợp
          </div>
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tên đăng nhập</th>
                  <th className="px-4 py-3">Họ tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {query.data?.items.map((account) => (
                  <tr key={account.MaTaiKhoan} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{account.TenDangNhap}</td>
                    <td className="px-4 py-3 text-slate-700">{account.HoTen}</td>
                    <td className="px-4 py-3 text-slate-700">{account.Email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          account.TrangThai === 'Khóa'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-green-50 text-green-700'
                        }`}
                      >
                        {account.TrangThai}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/accounts/${account.MaTaiKhoan}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
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
                  Trang {query.data.pagination.page}/{query.data.pagination.totalPages} — tổng{' '}
                  {query.data.pagination.total} tài khoản
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={page >= query.data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-slate-300 px-3 py-1 disabled:opacity-40"
                  >
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
