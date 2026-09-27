import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAdminSupportDetail, useAdminUpdateSupportRequest } from '../features/support/hooks';
import { ApiError } from '../services/apiClient';

export default function AdminSupportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const requestId = Number(id);
  const requestQuery = useAdminSupportDetail(requestId);
  const updateMutation = useAdminUpdateSupportRequest();
  const [ketQuaXuLy, setKetQuaXuLy] = useState('');

  if (requestQuery.isLoading) {
    return <div className="flex justify-center py-16"><div className="spinner"></div></div>;
  }

  if (requestQuery.isError || !requestQuery.data) {
    return <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700 border border-red-200">{requestQuery.error instanceof ApiError ? requestQuery.error.message : 'Không tìm thấy yêu cầu'}</div>;
  }

  const r = requestQuery.data;
  const isResolved = r.TrangThai === 'Đã xử lý';

  const claim = () => updateMutation.mutate({ id: requestId, payload: { trangThai: 'Đang xử lý' } });
  const resolve = () => {
    if (!ketQuaXuLy.trim()) {
      alert('Vui lòng nhập kết quả xử lý');
      return;
    }
    updateMutation.mutate({ id: requestId, payload: { trangThai: 'Đã xử lý', ketQuaXuLy: ketQuaXuLy.trim() } });
  };

  return (
    <div className="flex flex-col gap-6 max-w-[800px] mx-auto w-full">
      <Link to="/admin/support" className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại danh sách</span>
      </Link>

      <div className="bg-white border border-border rounded-[16px] shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
              <i className="ph-fill ph-warning-circle"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-heading">Ticket #TCK-{r.MaYeuCauHoTro}</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        r.TrangThai === 'Mới' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        r.TrangThai === 'Đang xử lý' ? 'bg-primary-50 text-primary-700 border-primary-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                  {r.TrangThai === 'Mới' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                  {r.TrangThai}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Khởi tạo: {new Date(r.NgayTao).toLocaleString('vi-VN')} • Mức độ: Khẩn cấp
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 text-xs bg-slate-50/40">
          {updateMutation.isError && (
             <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
               {updateMutation.error instanceof ApiError ? updateMutation.error.message : 'Không thể cập nhật yêu cầu'}
             </div>
          )}
          {updateMutation.isSuccess && (
             <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
               Cập nhật ticket thành công.
             </div>
          )}

          <div className="bg-white p-4 rounded-xl border border-border shadow-sm space-y-2">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Thông tin khách hàng & Yêu cầu</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
              <div>Họ tên: <strong className="text-heading">{r.TAI_KHOAN_YEU_CAU_HO_TRO_MaTaiKhoanKhachHangToTAI_KHOAN.HoTen}</strong></div>
              <div>Email: <strong className="text-heading">{r.TAI_KHOAN_YEU_CAU_HO_TRO_MaTaiKhoanKhachHangToTAI_KHOAN.Email}</strong></div>
              {r.DAT_PHONG && (
                <div>Mã Booking: <span className="font-mono text-primary-700 font-bold">{r.DAT_PHONG.MaXacNhanDatPhong}</span></div>
              )}
              <div>Phân loại: <span className="font-medium text-slate-700">{r.LoaiYeuCau}</span></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-border shadow-sm space-y-2">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Nội dung yêu cầu / khiếu nại</h4>
            <div className="p-3 bg-slate-50 border border-border rounded-lg text-slate-800 leading-relaxed font-medium">
              <div className="font-bold mb-1">{r.TieuDe}</div>
              <div className="whitespace-pre-wrap">{r.NoiDung}</div>
            </div>
          </div>
          
          {r.TAI_KHOAN_YEU_CAU_HO_TRO_MaTaiKhoanXuLyToTAI_KHOAN && (
             <div className="text-[11px] text-slate-500 font-medium">
               Người phụ trách xử lý: <strong className="text-heading">{r.TAI_KHOAN_YEU_CAU_HO_TRO_MaTaiKhoanXuLyToTAI_KHOAN.HoTen}</strong>
             </div>
          )}

          {isResolved ? (
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 shadow-sm space-y-2 mt-2">
              <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <i className="ph-fill ph-check-circle text-emerald-600"></i> Phản hồi / Kết quả xử lý
              </h4>
              <p className="text-[11px] text-emerald-700/80 mb-2">Đã giải quyết vào {r.NgayXuLy ? new Date(r.NgayXuLy).toLocaleString('vi-VN') : ''}</p>
              <div className="p-3 bg-white border border-emerald-200/60 rounded-lg text-emerald-900 leading-relaxed font-medium whitespace-pre-wrap shadow-xs">
                {r.KetQuaXuLy}
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl border border-border shadow-sm space-y-3 mt-2">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Phản hồi & Cập nhật trạng thái</h4>
              
              {r.TrangThai === 'Mới' && (
                <div className="pb-3 border-b border-border">
                  <button onClick={claim} disabled={updateMutation.isPending} className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 rounded-xl text-sm font-bold transition flex items-center gap-2">
                    <i className="ph-fill ph-hand-palm"></i> Tiếp nhận xử lý
                  </button>
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-slate-600 block">Biên bản / Kết quả giải quyết sự cố <span className="text-rose-500">*</span></label>
                <textarea 
                  value={ketQuaXuLy}
                  onChange={(e) => setKetQuaXuLy(e.target.value)}
                  rows={4} 
                  placeholder="Nhập chi tiết hướng giải quyết, mức bồi thường, hoặc kết quả thương lượng với khách hàng..." 
                  className="w-full px-3 py-2 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={resolve} 
                  disabled={updateMutation.isPending || !ketQuaXuLy.trim()}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Đang lưu...' : 'Xác nhận Đã giải quyết (Resolved)'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
