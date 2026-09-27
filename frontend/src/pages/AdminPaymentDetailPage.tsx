import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../services/apiClient';
import { getAdminPayment } from '../features/admin/payments/api';

export default function AdminPaymentDetailPage() {
  const id = Number(useParams().id);
  const query = useQuery({ queryKey: ['admin', 'payments', id], queryFn: () => getAdminPayment(id) });
  if (query.isLoading) return <div role="status">Đang tải...</div>;
  if (query.isError || !query.data) return <div role="alert">{query.error instanceof ApiError ? query.error.message : 'Không tìm thấy giao dịch'}</div>;
  const payment = query.data;
  return <div className="space-y-4"><Link className="text-blue-600" to="/admin/payments">← Danh sách giao dịch</Link><h1 className="text-2xl font-bold">Giao dịch #{payment.MaThanhToan}</h1><p>{payment.PhuongThucThanhToan} · {payment.TrangThai} · {Number(payment.SoTien).toLocaleString('vi-VN')} đ</p><dl className="rounded-xl border bg-white p-5 text-sm"><dt className="font-semibold">Booking</dt><dd>{payment.DAT_PHONG.MaXacNhanDatPhong}</dd><dt className="mt-3 font-semibold">Khách hàng</dt><dd>{payment.DAT_PHONG.TAI_KHOAN.HoTen}</dd><dt className="mt-3 font-semibold">Khách sạn</dt><dd>{payment.DAT_PHONG.KHACH_SAN.TenKhachSan}</dd></dl><h2 className="font-semibold">Hoàn tiền</h2>{payment.HOAN_TIEN.length ? payment.HOAN_TIEN.map((refund) => <p key={refund.MaHoanTien}>{Number(refund.SoTienHoan).toLocaleString('vi-VN')} đ · {refund.TrangThai}</p>) : <p>Không có hoàn tiền.</p>}</div>;
}
