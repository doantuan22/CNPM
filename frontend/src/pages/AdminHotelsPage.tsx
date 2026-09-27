import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../services/apiClient';
import { listAdminHotels } from '../features/admin/hotels/api';

export default function AdminHotelsPage() {
  const [page, setPage] = useState(1); const [search, setSearch] = useState(''); const [status, setStatus] = useState('');
  const query = useQuery({ queryKey: ['admin', 'hotels', page, search, status], queryFn: () => listAdminHotels({ page, limit: 20, search: search || undefined, TrangThai: status || undefined }) });
  if (query.isLoading) return <div role="status">Đang tải...</div>;
  if (query.isError) return <div role="alert">{query.error instanceof ApiError ? query.error.message : 'Không thể tải khách sạn'}</div>;
  const data = query.data!;
  return <div className="space-y-5"><h1 className="text-2xl font-bold">Quản lý khách sạn</h1>
    <div className="flex flex-wrap gap-2"><input aria-label="Tìm khách sạn" className="rounded border p-2" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm tên khách sạn" /><select aria-label="Lọc trạng thái" className="rounded border p-2" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">Tất cả trạng thái</option><option value="Hoạt động">Hoạt động</option><option value="Đình chỉ">Đình chỉ</option></select></div>
    {data.items.length === 0 ? <p>Chưa có khách sạn phù hợp.</p> : <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-sm"><thead><tr><th className="p-3 text-left">Tên</th><th className="text-left">Địa phương</th><th className="text-left">Trạng thái</th><th /></tr></thead><tbody>{data.items.map((hotel) => <tr className="border-t" key={hotel.MaKhachSan}><td className="p-3">{hotel.TenKhachSan}</td><td>{hotel.DIA_PHUONG?.TenThanhPho ?? '—'}</td><td>{hotel.TrangThai}</td><td><Link className="text-blue-600" to={`/admin/hotels/${hotel.MaKhachSan}`}>Chi tiết</Link></td></tr>)}</tbody></table></div>}
    <div className="flex items-center gap-3"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trang trước</button><span>Trang {data.pagination.page}/{data.pagination.totalPages}</span><button type="button" disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)}>Trang sau</button></div>
  </div>;
}
