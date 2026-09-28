import { Link, useParams } from 'react-router-dom';
import { useOwnerBooking } from '../features/owner/hooks';
import { formatCurrencyVND } from '../lib/utils';
import { ApiError } from '../services/apiClient';
import { StatusBadge } from '../components/domain/StatusBadge';

export default function OwnerBookingDetailPage() {
  const { id, bookingId } = useParams<{ id: string; bookingId: string }>(); 
  const hotelId = Number(id); 
  const booking = useOwnerBooking(hotelId, Number(bookingId));
  
  if (booking.isLoading) {
    return <div className="flex justify-center py-16" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span className="sr-only">Đang tải...</span></div>;
  }
  
  if (booking.isError || !booking.data) {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700 border border-red-200">
        {booking.error instanceof ApiError ? booking.error.message : 'Không tìm thấy booking'}
      </div>
    );
  }
  
  const b = booking.data;

  return (
    <div className="flex flex-col gap-6 max-w-[800px] mx-auto w-full">
      <Link to={`/owner/hotels/${hotelId}/bookings`} className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại danh sách booking</span>
      </Link>

      <div className="bg-white border border-border rounded-[16px] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              <i className="ph-fill ph-ticket text-[20px]"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">#{b.MaXacNhanDatPhong}</h3>
                <StatusBadge domain="booking" status={b.TrangThai} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Ngày tạo: {new Date(b.NgayTao).toLocaleString('vi-VN')}</p>
            </div>
          </div>
          <button type="button" onClick={() => window.print()} className="px-4 py-2 bg-white border border-border rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-2 print:hidden">
            <i className="ph ph-printer"></i> In phiếu
          </button>
        </div>

        {/* Auto Confirm Notification Banner */}
        {(b.TrangThai === 'Đã xác nhận' || b.TrangThai === 'Hoàn tất') && (
          <div className="bg-blue-50/80 px-6 py-3 border-b border-blue-100 flex items-start gap-2.5">
            <i className="ph-fill ph-info text-primary mt-0.5"></i>
            <p className="text-xs text-blue-900 leading-relaxed font-medium">
              Đơn đặt phòng này đã được <strong className="text-primary-700">hệ thống Egode tự động xác nhận</strong>. Khách sạn không cần thao tác duyệt đơn thủ công.
            </p>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* 1. Thông tin khách hàng */}
          <div className="bg-white border border-border rounded-2xl p-4.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <i className="ph-fill ph-user text-primary"></i> Thông tin khách hàng
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm pt-1">
              <div>
                <span className="text-xs text-slate-400 block">Họ và tên khách:</span>
                <span className="font-bold text-slate-900">{b.KhachHang.HoTen}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Số điện thoại liên hệ:</span>
                <a href={`tel:${b.KhachHang.SoDienThoai}`} className="font-semibold text-slate-900 hover:text-primary">{b.KhachHang.SoDienThoai}</a>
              </div>
            </div>
          </div>

          {/* 2. Thông tin phòng & Lịch lưu trú */}
          <div className="bg-white border border-border rounded-2xl p-4.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <i className="ph-fill ph-bed text-primary"></i> Chi tiết phòng & Thời gian lưu trú
              </h4>
              <span className="text-xs font-semibold text-primary">
                {Math.ceil((new Date(b.NgayTraPhong).getTime() - new Date(b.NgayNhanPhong).getTime()) / (1000 * 3600 * 24))} đêm
              </span>
            </div>
            
            {b.ChiTietPhong.map(room => (
              <div key={room.MaLoaiPhong} className="bg-slate-50 p-3.5 rounded-xl flex items-center justify-between mb-2">
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">{room.TenLoaiPhong}</h5>
                  <p className="text-xs text-slate-500 mt-0.5">{room.SoLuong} phòng</p>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 border border-border rounded-xl bg-slate-50/50">
                <div className="text-[11px] uppercase font-bold text-slate-400">Nhận phòng (Check-in)</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{new Date(b.NgayNhanPhong).toLocaleDateString('vi-VN')}</div>
                <div className="text-[11px] text-slate-500">Từ {b.GioNhanPhong.slice(11, 16)}</div>
              </div>
              <div className="p-3 border border-border rounded-xl bg-slate-50/50">
                <div className="text-[11px] uppercase font-bold text-slate-400">Trả phòng (Check-out)</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{new Date(b.NgayTraPhong).toLocaleDateString('vi-VN')}</div>
                <div className="text-[11px] text-slate-500">Trước {b.GioTraPhong.slice(11, 16)}</div>
              </div>
            </div>
          </div>

          {/* 3. Ghi chú (nếu có) */}
          {b.GhiChu && (
            <div className="bg-white border border-border rounded-2xl p-4.5 shadow-sm space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <i className="ph-fill ph-warning-circle text-amber-500"></i> Yêu cầu đặc biệt từ khách
              </h4>
              <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs text-amber-900 leading-relaxed font-medium">
                "{b.GhiChu}"
              </div>
            </div>
          )}

          {/* 4. Hóa đơn & Trạng thái thanh toán */}
          <div className="bg-white border border-border rounded-2xl p-4.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <i className="ph-fill ph-currency-circle-dollar text-emerald-600"></i> Chi tiết thanh toán
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="pt-2.5 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Tổng số tiền cần thu:</span>
                <span className="text-lg font-extrabold text-primary-700">{formatCurrencyVND(b.TongTienThanhToan)}</span>
              </div>
            </div>

            {b.ThanhToan.map((p) => (
              <div key={p.MaThanhToan} className="mt-3 p-3 bg-slate-50 rounded-xl border border-border text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Phương thức:</span>
                  <strong className="text-slate-700">{p.PhuongThucThanhToan}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Số tiền:</span>
                  <strong className="text-slate-700">{formatCurrencyVND(p.SoTien)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái giao dịch:</span>
                  <span className={`font-semibold ${p.TrangThai === 'Thành công' ? 'text-emerald-600' : p.TrangThai === 'Thất bại' ? 'text-rose-600' : 'text-amber-600'}`}>
                    {p.TrangThai}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
