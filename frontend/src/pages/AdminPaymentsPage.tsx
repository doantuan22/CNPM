import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../services/apiClient';
import { listAdminPayments } from '../features/admin/payments/api';
import { StatusBadge } from '../components/domain/StatusBadge';
import { formatDateTimeVi } from '../lib/utils';
import { useListParams, useUrlSearchInput } from '../hooks/useListParams';
import { Pagination } from '../components/common/Pagination';
import { PageSpinner } from '../components/common/PageSpinner';

const STATUSES = ['Thành công', 'Chờ xử lý', 'Thất bại'];

const FILTER_DEFAULTS = { search: '', status: '', method: '', refunded: '' };

export default function AdminPaymentsPage() {
  const { values, page, setValue, setPage, reset } = useListParams(FILTER_DEFAULTS);
  const [searchInput, setSearchInput] = useUrlSearchInput(values.search, (value) => setValue('search', value));
  const search = values.search;
  const status = values.status;
  const setStatus = (value: string) => setValue('status', value);
  const method = values.method;
  const setMethod = (value: string) => setValue('method', value);
  const refundedOnly = values.refunded === '1';

  const query = useQuery({ 
    queryKey: ['admin', 'payments', page, search, status, method, refundedOnly],
    queryFn: () => listAdminPayments({
      page,
      limit: 10,
      search: search || undefined,
      TrangThai: status === 'ALL' ? undefined : status || undefined,
      PhuongThucThanhToan: method === 'ALL' ? undefined : method || undefined,
      coHoanTien: refundedOnly || undefined,
    })
  });

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setPage(1);
  };

  const resetFilters = () => reset();

  return (
    <div className="admin-list-page flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">Thanh toán & Giao dịch</h1>
          <p className="text-sm text-slate-500 mt-0.5">Giám sát luồng tiền đặt phòng trực tuyến, đối soát với cổng đối tác và theo dõi các khoản hoàn tiền.</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[16px] border border-border shadow-sm space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 text-xs">
          <div className="md:col-span-5 relative">
            <label htmlFor="admin-payments-field-1" className="block font-semibold text-slate-600 mb-1.5">Tìm kiếm giao dịch</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <i className="ph ph-magnifying-glass text-[16px]"></i>
              </div>
              <input id="admin-payments-field-1" 
                type="text" 
                value={searchInput} 
                onChange={(e) => handleSearchChange(e.target.value)} 
                placeholder="Nhập mã booking, mã tham chiếu..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-heading"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="admin-payments-field-2" className="block font-semibold text-slate-600 mb-1.5">Trạng thái giao dịch</label>
            <select id="admin-payments-field-2" 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }} 
              className="w-full px-3 py-2.5 bg-slate-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-heading"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="admin-payments-field-3" className="block font-semibold text-slate-600 mb-1.5">Phương thức</label>
            <select id="admin-payments-field-3" 
              value={method} 
              onChange={(e) => { setMethod(e.target.value); setPage(1); }} 
              className="w-full px-3 py-2.5 bg-slate-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-heading"
            >
              <option value="ALL">Tất cả cổng</option>
              <option value="VNPAY">VNPAY</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button onClick={resetFilters} className="w-full py-2.5 px-3 border border-border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold text-xs transition flex items-center justify-center gap-1.5">
              <i className="ph ph-arrow-counter-clockwise"></i> Đặt lại
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs mt-3">
          <span className="text-slate-400 font-medium">Lọc nhanh:</span>
          <button type="button" aria-pressed={refundedOnly} onClick={() => { setValue('refunded', refundedOnly ? '' : '1'); setPage(1); }} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-medium hover:bg-amber-100 transition aria-pressed:ring-2 aria-pressed:ring-amber-300">Giao dịch có hoàn tiền</button>
          <button type="button" onClick={() => { setStatus('Thất bại'); setPage(1); }} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-medium hover:bg-rose-100 transition">Lệnh thất bại</button>
          <button type="button" onClick={() => { setStatus('Thành công'); setPage(1); }} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 transition">Đã quyết toán</button>
        </div>
      </div>

      <div className="bg-white rounded-[16px] border border-border shadow-sm overflow-hidden flex flex-col">
        {query.isLoading ? (
          <PageSpinner />
        ) : query.isError ? (
          <div role="alert" className="px-6 py-10 text-center text-sm text-red-700">
            {query.error instanceof ApiError ? query.error.message : 'Không thể tải giao dịch'}
          </div>
        ) : query.data && query.data.items.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <i className="ph ph-credit-card text-[28px]"></i>
            </div>
            <h4 className="text-sm font-bold text-heading">Không tìm thấy giao dịch nào</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">Chưa có giao dịch thanh toán nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Mã Giao dịch</th>
                  <th className="py-3.5 px-4">Booking</th>
                  <th className="py-3.5 px-4 text-right">Số tiền (VNĐ)</th>
                  <th className="py-3.5 px-4">Phương thức</th>
                  <th className="py-3.5 px-4 text-center">Thời gian</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {query.data?.items.map((payment) => (
                  <tr key={payment.MaThanhToan} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-mono font-bold text-slate-800 text-sm">{payment.MaGiaoDichDoiTac || `PAY-${payment.MaThanhToan}`}</div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-primary-600">
                      #{payment.DAT_PHONG.MaXacNhanDatPhong}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <strong className="text-heading text-sm">{Number(payment.SoTien).toLocaleString('vi-VN')} đ</strong>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">{payment.PhuongThucThanhToan}</span>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-500 text-[11px]">
                      {formatDateTimeVi(payment.ThoiGianGiaoDich)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge domain="payment" status={payment.TrangThai} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Link to={`/admin/payments/${payment.MaThanhToan}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 transition border border-primary-200/60">
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
          <Pagination page={page} totalPages={query.data.pagination.totalPages} total={query.data.pagination.total} itemLabel="giao dịch" onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
