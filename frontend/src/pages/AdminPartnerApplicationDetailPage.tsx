import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, refreshSession } from '../services/apiClient';
import { useAdminPartnerApplication, useApprovePartnerApplication, useRejectPartnerApplication } from '../features/partners/hooks';

export default function AdminPartnerApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const applicationId = Number(id);
  const query = useAdminPartnerApplication(Number.isFinite(applicationId) ? applicationId : null);
  const approve = useApprovePartnerApplication();
  const reject = useRejectPartnerApplication();
  const [reason, setReason] = useState('');

  if (query.isLoading) return <div className="flex justify-center py-16"><div className="spinner"></div></div>;
  if (query.isError || !query.data) return <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700 border border-red-200">{query.error instanceof ApiError ? query.error.message : 'Không tìm thấy hồ sơ đối tác'}</div>;

  const application = query.data;
  const pending = application.TrangThaiDuyet === 'Chờ duyệt';
  const actionError = approve.error ?? reject.error;
  
  const onApprove = async () => { 
    if (window.confirm('Xác nhận phê duyệt hồ sơ đối tác này?')) {
      await approve.mutateAsync(application.MaHoSoDoiTac); 
      await refreshSession(); 
    }
  };
  
  const onReject = () => { 
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }
    if (window.confirm('Xác nhận từ chối hồ sơ này?')) {
      reject.mutate({ id: application.MaHoSoDoiTac, reason: reason.trim() }); 
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[800px] mx-auto w-full">
      <Link to="/admin/partner-applications" className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại danh sách</span>
      </Link>

      <div className="bg-white border border-border rounded-[16px] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              <i className="ph-fill ph-files text-[24px]"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-heading">Hồ sơ đăng ký #{application.MaHoSoDoiTac}</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        application.TrangThaiDuyet === 'Chờ duyệt' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        application.TrangThaiDuyet === 'Đã duyệt' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                  {application.TrangThaiDuyet}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                Nộp lúc: {new Date(application.NgayNop).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {(approve.isSuccess || reject.isSuccess) && (
             <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
               Hồ sơ đã được xử lý thành công.
             </div>
          )}
          {actionError && (
             <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
               {actionError instanceof ApiError ? actionError.message : 'Không thể xử lý hồ sơ'}
             </div>
          )}
          {application.LyDoTuChoi && !pending && (
             <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
               <strong className="block mb-1 text-xs uppercase tracking-wider">Lý do từ chối:</strong>
               {application.LyDoTuChoi}
             </div>
          )}

          {/* 1. Thông tin người nộp */}
          <div className="bg-slate-50 border border-border rounded-2xl p-5 space-y-3">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <i className="ph-fill ph-user-circle text-primary"></i> 1. Thông tin người đại diện nộp hồ sơ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Họ và tên người đại diện:</span>
                <strong className="text-heading text-sm">{application.TAI_KHOAN_HO_SO_DOI_TAC_MaTaiKhoanToTAI_KHOAN.HoTen}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Số điện thoại liên lạc:</span>
                <strong className="text-heading text-sm">{(application.TAI_KHOAN_HO_SO_DOI_TAC_MaTaiKhoanToTAI_KHOAN as any).SoDienThoai}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Địa chỉ Email:</span>
                <span className="font-medium text-slate-700 text-sm">{application.TAI_KHOAN_HO_SO_DOI_TAC_MaTaiKhoanToTAI_KHOAN.Email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Số CCCD / Hộ chiếu:</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{application.SoCCCD}</span>
              </div>
            </div>
          </div>

          {/* 2. Thông tin pháp lý */}
          <div className="bg-white border border-border rounded-2xl p-5 space-y-3 shadow-sm">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <i className="ph-fill ph-buildings text-primary"></i> 2. Thông tin pháp lý doanh nghiệp
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="md:col-span-2">
                <span className="text-slate-400 block text-[11px]">Số Giấy phép kinh doanh:</span>
                <strong className="text-sm font-bold text-heading">{application.SoGiayPhepKinhDoanh}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Mã số thuế (MST):</span>
                <span className="font-mono font-bold text-primary-700 text-sm">{application.MaSoThue}</span>
              </div>
            </div>
          </div>

          {/* 3. Tệp đính kèm */}
          <div className="bg-white border border-border rounded-2xl p-5 space-y-3 shadow-sm">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <i className="ph-fill ph-file-pdf text-emerald-600"></i> 3. Hồ sơ pháp lý & Giấy tờ thẩm định
            </h4>
            <div className="pt-2">
              <div className="p-3 bg-slate-50 border border-border rounded-xl flex items-center justify-between hover:bg-slate-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[11px]">
                     TỆP
                  </div>
                  <div>
                    <div className="font-bold text-heading text-sm">Tài liệu hồ sơ đính kèm</div>
                    <div className="text-[11px] text-slate-400 max-w-[200px] truncate sm:max-w-xs">{application.TepGiayTo}</div>
                  </div>
                </div>
                <a href={application.TepGiayTo} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white border border-border text-primary-700 font-bold rounded-lg hover:bg-primary-50 transition text-xs">
                  Xem tệp
                </a>
              </div>
            </div>
          </div>

          {/* Xử lý duyệt / từ chối */}
          {pending && (
            <div className="bg-slate-50 border border-border rounded-2xl p-5 space-y-4">
               <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                 <i className="ph-fill ph-gavel text-amber-600"></i> Quyết định thẩm định
               </h4>
               
               <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Lý do chi tiết (bắt buộc nếu từ chối) <span className="text-rose-500">*</span></label>
                  <textarea 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)} 
                    rows={3} 
                    placeholder="Ghi rõ các loại giấy tờ còn thiếu, thông tin chưa khớp hoặc lý do từ chối..." 
                    className="w-full px-3 py-2 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition resize-none"
                  ></textarea>
               </div>

               <div className="flex flex-col sm:flex-row gap-3 pt-2">
                 <button 
                   onClick={onReject} 
                   disabled={!reason.trim() || reject.isPending || approve.isPending}
                   className="flex-1 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                   <i className="ph ph-x-circle"></i> {reject.isPending ? 'Đang xử lý...' : 'Từ chối hồ sơ'}
                 </button>
                 <button 
                   onClick={onApprove} 
                   disabled={approve.isPending || reject.isPending}
                   className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                   <i className="ph ph-check-circle"></i> {approve.isPending ? 'Đang xử lý...' : 'Phê duyệt hồ sơ'}
                 </button>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}