import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useOwnerBooking } from '../features/owner/hooks';
import { formatCurrencyVND } from '../lib/utils';
import { ApiError } from '../services/apiClient';

export default function OwnerBookingDetailPage() {
  const { id, bookingId } = useParams<{ id: string; bookingId: string }>(); const hotelId = Number(id); const booking = useOwnerBooking(hotelId, Number(bookingId));
  if (booking.isLoading) return <div role="status" className="py-16 text-center">Đang tải booking...</div>;
  if (booking.isError || !booking.data) return <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{booking.error instanceof ApiError ? booking.error.message : 'Không tìm thấy booking'}</div>;
  const b = booking.data;
  return <div className="mx-auto max-w-3xl space-y-6"><Button variant="ghost" size="sm" asChild><Link to={`/owner/hotels/${hotelId}/bookings`}><ArrowLeft className="mr-1 h-4 w-4" /> Danh sách booking</Link></Button><section className="rounded-xl border bg-white p-6 space-y-4"><div><h1 className="text-2xl font-bold">{b.MaXacNhanDatPhong}</h1><p className="text-sm text-slate-500">Khách hàng: {b.KhachHang.HoTen}</p></div><dl className="grid grid-cols-2 gap-4 text-sm"><div><dt className="text-slate-500">Nhận / trả</dt><dd>{b.NgayNhanPhong} → {b.NgayTraPhong}</dd></div><div><dt className="text-slate-500">Trạng thái</dt><dd>{b.TrangThai}</dd></div><div><dt className="text-slate-500">Tổng tiền</dt><dd>{formatCurrencyVND(b.TongTienThanhToan)}</dd></div><div><dt className="text-slate-500">Ngày tạo</dt><dd>{new Date(b.NgayTao).toLocaleString('vi-VN')}</dd></div></dl><div><h2 className="font-semibold">Loại phòng</h2>{b.ChiTietPhong.map((line) => <p key={line.MaLoaiPhong} className="text-sm">{line.TenLoaiPhong} · {line.SoLuong} phòng</p>)}</div><div><h2 className="font-semibold">Thanh toán</h2>{b.ThanhToan.length ? b.ThanhToan.map((p) => <p key={p.MaThanhToan} className="text-sm">{p.PhuongThucThanhToan} · {p.TrangThai} · {formatCurrencyVND(p.SoTien)}</p>) : <p className="text-sm text-slate-500">Chưa có giao dịch thanh toán.</p>}</div></section></div>;
}
