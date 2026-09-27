import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../services/apiClient';
import { listAdminPayments } from '../features/admin/payments/api';

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1); const [search, setSearch] = useState(''); const [status, setStatus] = useState('');
  const query = useQuery({ queryKey: ['admin', 'payments', page, search, status], queryFn: () => listAdminPayments({ page, limit: 20, search: search || undefined, TrangThai: status || undefined }) });
  if (query.isLoading) return <div role="status">Đang tải...</div>;
  if (query.isError) return <div role="alert">{query.error instanceof ApiError ? query.error.message : 'Không thể tải giao dịch'}</div>;
  const data = query.data!;
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Giao dịch thanh toán</h1>
    <div className="flex flex-wrap gap-2"><input aria-label="Tìm giao dịch" className="rounded border p-2" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Mã booking hoặc giao dịch" /><select aria-label="Lọc trạng thái thanh toán" className="rounded border p-2" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">Tất cả trạng thái</option><option value="Thành công">Thành công</option><option value="Chờ xử lý">Chờ xử lý</option><option value="Thất bại">Thất bại</option></select></div>
    {data.items.length === 0 ? <p>Chưa có giao dịch phù hợp.</p> : <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-sm"><thead><tr><th className="p-3 text-left">Mã booking</th><th className="text-left">Số tiền</th><th className="text-left">Trạng thái</th><th /></tr></thead><tbody>{data.items.map((payment) => <tr className="border-t" key={payment.MaThanhToan}><td className="p-3">{payment.DAT_PHONG.MaXacNhanDatPhong}</td><td>{Number(payment.SoTien).toLocaleString('vi-VN')} đ</td><td>{payment.TrangThai}</td><td><Link className="text-blue-600" to={`/admin/payments/${payment.MaThanhToan}`}>Chi tiết</Link></td></tr>)}</tbody></table></div>}
    <div className="flex items-center gap-3"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trang trước</button><span>Trang {data.pagination.page}/{data.pagination.totalPages}</span><button type="button" disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)}>Trang sau</button></div>
  </div>;
}
