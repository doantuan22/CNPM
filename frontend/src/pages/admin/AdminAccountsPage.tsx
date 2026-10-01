import { Link } from 'react-router-dom';
import { useAccountList } from '../../features/admin/accounts/hooks';
import { ApiError } from '../../services/apiClient';
import { StatusBadge } from '../../components/domain/StatusBadge';
import { useListParams, useUrlSearchInput } from '../../hooks/useListParams';
import { Pagination } from '../../components/common/Pagination';
import type { Account } from '../../types/auth';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable, type Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';

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

  const columns: Column<Account>[] = [
    { key: 'id', header: 'ID', className: 'w-20', cell: (account) => <span className="font-mono font-bold text-ink-muted">#{account.MaTaiKhoan}</span> },
    { key: 'username', header: 'Tên đăng nhập', cell: (account) => <span className="font-semibold text-heading">{account.TenDangNhap}</span> },
    {
      key: 'person',
      header: 'Họ tên & Email',
      cell: (account) => (
        <>
          <div className="font-bold text-heading">{account.HoTen}</div>
          <div className="text-[11px] text-ink-muted">{account.Email}</div>
        </>
      ),
    },
    { key: 'role', header: 'Vai trò', align: 'center', cell: (account) => <span className="text-ink-sub">{account.VAI_TRO?.TenVaiTro ?? '—'}</span> },
    { key: 'status', header: 'Trạng thái', align: 'center', cell: (account) => <StatusBadge domain="account" status={account.TrangThai} /> },
    {
      key: 'profile',
      header: 'Hồ sơ',
      align: 'center',
      cell: (account) => (
        <Link to={`/admin/accounts/${account.MaTaiKhoan}`} className="admin-row-link">
          <span>Mở hồ sơ</span>
          <Icon name="arrow-up-right" />
        </Link>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
      <PageHeader
        title="Quản lý tài khoản"
        description="Giám sát phân quyền, xác thực danh tính, trạng thái hoạt động và cấu hình người dùng trên toàn hệ thống."
        actions={
          <Button asChild>
            <Link to="/admin/accounts/new"><Icon name="plus" size={16} /><span>Thêm tài khoản</span></Link>
          </Button>
        }
      />

      <FilterBar>
        <div className="min-w-[240px] flex-[2]">
          <Input
            label="Tìm kiếm tài khoản"
            type="text"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
            placeholder="Nhập họ tên, email, tên đăng nhập..."
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <Select label="Trạng thái hoạt động" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Tất cả trạng thái</option>
            <option value="Hoạt động">Đang hoạt động</option>
            <option value="Khóa">Đang bị khóa</option>
          </Select>
        </div>
        {(search || status) && <div className="admin-active-filters basis-full" aria-label="Bộ lọc đang dùng">
          {search && <button type="button" onClick={() => { setSearchInput(''); setPage(1); }}>Tìm kiếm: {search} <span aria-hidden="true">×</span></button>}
          {status && <button type="button" onClick={() => { setStatus(''); setPage(1); }}>Trạng thái: {status} <span aria-hidden="true">×</span></button>}
          <button type="button" className="admin-active-filters__clear" onClick={resetFilters}>Xóa bộ lọc</button>
        </div>}
      </FilterBar>

      <DataTable
        caption="Danh sách tài khoản"
        columns={columns}
        rows={query.data?.items}
        getRowKey={(account) => account.MaTaiKhoan}
        isLoading={query.isLoading}
        error={query.isError ? (query.error instanceof ApiError ? query.error.message : 'Không thể tải danh sách tài khoản') : null}
        emptyTitle="Không tìm thấy tài khoản nào phù hợp"
        emptyDescription="Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc làm mới bộ lọc."
        emptyIcon="users"
        footer={query.data && (
          <Pagination page={page} totalPages={query.data.pagination.totalPages} total={query.data.pagination.total} itemLabel="tài khoản" onPageChange={setPage} />
        )}
      />
    </div>
  );
}
