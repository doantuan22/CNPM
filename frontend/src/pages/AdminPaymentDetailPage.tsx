import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../services/apiClient';
import { getAdminPayment } from '../features/admin/payments/api';

export default function AdminPaymentDetailPage() {
  const id = Number(useParams().id);
  const query = useQuery({ queryKey: ['admin', 'payments', id], queryFn: () => getAdminPayment(id) });

  if (query.isLoading) {
    return <div className="flex justify-center py-16"><div className="spinner"></div></div>;
  }

  if (query.isError || !query.data) {
    return <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700 border border-red-200">{query.error instanceof ApiError ? query.error.message : 'Không tìm thấy giao dịch'}</div>;
  }

  const payment = query.data;

  return (
    <div className="flex flex-col gap-6 max-w-[600px] mx-auto w-full">
      <Link to="/admin/payments" className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại danh sách</span>
      </Link>

      <div className="bg-white border border-border rounded-[16px] shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary-700 flex items-center justify-center font-bold text-lg">
              <i className="ph-fill ph-credit-card"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-heading">
                  {payment.MaGiaoDichDoiTac || `PAY-${payment.MaThanhToan}`}
                </h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        payment.TrangThai === 'Thành công' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        payment.TrangThai === 'Chờ xử lý' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                  {payment.TrangThai}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Booking: <strong className="font-mono">#{payment.DAT_PHONG.MaXacNhanDatPhong}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Thông tin số tiền */}
          <div className="bg-slate-50 border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold text-sm">Tổng giá trị giao dịch:</span>
              <span className="text-xl font-black text-heading">{Number(payment.SoTien).toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border mt-1">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Khách hàng thanh toán:</span>
                <strong className="text-heading text-sm">{payment.DAT_PHONG.TAI_KHOAN.HoTen}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Cổng thanh toán:</span>
                <strong className="text-heading text-sm">{payment.PhuongThucThanhToan}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Mã tham chiếu đối tác (Bank Ref):</span>
                <span className="font-mono text-slate-700 font-bold">{payment.MaGiaoDichDoiTac || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Cơ sở lưu trú thụ hưởng:</span>
                <span className="font-medium text-slate-700">{payment.DAT_PHONG.KHACH_SAN.TenKhachSan}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-4 space-y-3 shadow-sm">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Timeline dòng tiền & trạng thái</h4>
            <div className="space-y-3 pl-2 border-l-2 border-primary/30 ml-1 text-xs pt-1">
              <div className="relative">
                 <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white"></div>
                 <div className="pl-3">
                   <div className="font-bold text-slate-700">Khởi tạo giao dịch (Chờ thanh toán)</div>
                   <div className="text-slate-400 text-[10px] mt-0.5">{new Date(payment.ThoiGianGiaoDich).toLocaleString('vi-VN')}</div>
                 </div>
              </div>
              {payment.TrangThai === 'Thành công' && (
                <div className="relative">
                   <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                   <div className="pl-3">
                     <div className="font-bold text-emerald-700">Thanh toán thành công (Webhook xác nhận)</div>
                     <div className="text-slate-400 text-[10px] mt-0.5">{new Date(payment.ThoiGianGiaoDich).toLocaleString('vi-VN')}</div>
                   </div>
                </div>
              )}
              {payment.TrangThai === 'Thất bại' && (
                <div className="relative">
                   <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white"></div>
                   <div className="pl-3">
                     <div className="font-bold text-rose-700">Giao dịch thất bại / Hết thời gian</div>
                     <div className="text-slate-400 text-[10px] mt-0.5">{new Date(payment.ThoiGianGiaoDich).toLocaleString('vi-VN')}</div>
                   </div>
                </div>
              )}
            </div>
          </div>

          {payment.HOAN_TIEN && payment.HOAN_TIEN.length > 0 && (
            <div className="space-y-3">
              {payment.HOAN_TIEN.map((refund) => (
                <div key={refund.MaHoanTien} className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 text-sm">
                      <i className="ph-fill ph-arrow-u-down-left text-amber-600"></i>
                      Thông tin hoàn tiền (Refund)
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {refund.TrangThai}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-amber-950">
                    <div>
                      <span className="text-amber-700/80 block text-[11px] mb-0.5">Số tiền hoàn trả:</span>
                      <strong className="text-rose-600 font-black text-sm">- {Number(refund.SoTienHoan).toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <div>
                      <span className="text-amber-700/80 block text-[11px] mb-0.5">Ngày yêu cầu:</span>
                      <span className="font-medium">{refund.NgayYeuCau ? new Date(refund.NgayYeuCau).toLocaleString('vi-VN') : ''}</span>
                    </div>
                    {(refund as any).LyDo && (
                      <div className="col-span-2 mt-1">
                        <span className="text-amber-700/80 block text-[11px] mb-0.5">Lý do hoàn tiền:</span>
                        <span className="italic text-amber-900/80 bg-white/50 px-2 py-1.5 rounded block border border-amber-100/50">{(refund as any).LyDo}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
