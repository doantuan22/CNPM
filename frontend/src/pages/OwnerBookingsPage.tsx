import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useOwnerBookings } from '../features/owner/hooks';
import { formatCurrencyVND } from '../lib/utils';
import { ApiError } from '../services/apiClient';

export default function OwnerBookingsPage() {
  const { id } = useParams<{ id: string }>(); const hotelId = Number(id); const [params, setParams] = useSearchParams();
  const filters = { page: Number(params.get('page') ?? 1), limit: 20, trangThai: params.get('trangThai') ?? undefined, search: params.get('search') ?? undefined, from: params.get('from') ?? undefined, to: params.get('to') ?? undefined };
  const query = useOwnerBookings(hotelId, filters);
  const set = (key: string, value: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); next.delete('page'); setParams(next); };
  if (query.isLoading) return <div role="status" className="py-16 text-center">Đang tải đặt phòng...</div>;
  if (query.isError) return <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{query.error instanceof ApiError ? query.error.message : 'Không thể tải danh sách đặt phòng'}</div>;
  const result = query.data!;
  return <div className="mx-auto max-w-5xl space-y-6"><Button variant="ghost" size="sm" asChild><Link to={`/owner/hotels/${hotelId}`}><ArrowLeft className="mr-1 h-4 w-4" /> Quay lại khách sạn</Link></Button><div><h1 className="text-2xl font-bold text-slate-900">Đặt phòng của khách sạn</h1><p className="text-sm text-slate-500">Chỉ xem thông tin vận hành; không thể sửa booking tại đây.</p></div><div className="flex flex-wrap gap-3 rounded-xl border bg-white p-4"><input aria-label="Tìm mã đặt phòng" value={filters.search ?? ''} onChange={(e) => set('search', e.target.value)} placeholder="Mã xác nhận" className="rounded border px-3 py-2 text-sm" /><select aria-label="Trạng thái booking" value={filters.trangThai ?? ''} onChange={(e) => set('trangThai', e.target.value)} className="rounded border px-3 py-2 text-sm"><option value="">Tất cả trạng thái</option>{['Chờ thanh toán','Đã xác nhận','Đã hủy','Hoàn tất'].map((s) => <option key={s}>{s}</option>)}</select></div>{result.items.length === 0 ? <p className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">Chưa có booking phù hợp.</p> : <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Mã</th><th>Khách hàng</th><th>Nhận / trả</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead><tbody>{result.items.map((b) => <tr key={b.MaDatPhong} className="border-t"><td className="p-3 font-medium">{b.MaXacNhanDatPhong}</td><td>{b.KhachHang.HoTen}</td><td>{b.NgayNhanPhong} → {b.NgayTraPhong}</td><td>{formatCurrencyVND(b.TongTienThanhToan)}</td><td>{b.TrangThai}</td><td><Link className="text-blue-600" to={`/owner/hotels/${hotelId}/bookings/${b.MaDatPhong}`}>Chi tiết</Link></td></tr>)}</tbody></table></div>}</div>;
}
