import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ApiError, refreshSession } from '../services/apiClient';
import { useAdminPartnerApplication, useApprovePartnerApplication, useRejectPartnerApplication } from '../features/partners/hooks';

export default function AdminPartnerApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const applicationId = Number(id);
  const query = useAdminPartnerApplication(Number.isFinite(applicationId) ? applicationId : null);
  const approve = useApprovePartnerApplication();
  const reject = useRejectPartnerApplication();
  const [reason, setReason] = useState('');

  if (query.isLoading) return <div className="flex justify-center py-16" role="status"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" /></div>;
  if (query.isError || !query.data) return <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">{query.error instanceof ApiError ? query.error.message : 'Không tìm thấy hồ sơ đối tác'}</div>;

  const application = query.data;
  const pending = application.TrangThaiDuyet === 'Chờ duyệt';
  const actionError = approve.error ?? reject.error;
  const onApprove = async () => { await approve.mutateAsync(application.MaHoSoDoiTac); await refreshSession(); };
  const onReject = () => { if (reason.trim()) reject.mutate({ id: application.MaHoSoDoiTac, reason: reason.trim() }); };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/admin/partner-applications" className="text-sm font-medium text-blue-600 hover:underline">← Quay lại danh sách</Link>
      <div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Hồ sơ đối tác #{application.MaHoSoDoiTac}</h1><p className="text-sm text-slate-500">{application.TAI_KHOAN_HO_SO_DOI_TAC_MaTaiKhoanToTAI_KHOAN.HoTen} · {application.TAI_KHOAN_HO_SO_DOI_TAC_MaTaiKhoanToTAI_KHOAN.Email}</p></div>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        {approve.isSuccess || reject.isSuccess ? <div role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Hồ sơ đã được xử lý thành công.</div> : null}
        {actionError ? <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{actionError instanceof ApiError ? actionError.message : 'Không thể xử lý hồ sơ'}</div> : null}
        <dl className="grid gap-4 sm:grid-cols-2 text-sm"><div><dt className="font-medium text-slate-500">Trạng thái</dt><dd className="mt-1 font-semibold text-slate-900">{application.TrangThaiDuyet}</dd></div><div><dt className="font-medium text-slate-500">Ngày nộp</dt><dd className="mt-1 text-slate-900">{new Date(application.NgayNop).toLocaleString('vi-VN')}</dd></div><div><dt className="font-medium text-slate-500">Số CCCD</dt><dd className="mt-1 text-slate-900">{application.SoCCCD}</dd></div><div><dt className="font-medium text-slate-500">Giấy phép kinh doanh</dt><dd className="mt-1 text-slate-900">{application.SoGiayPhepKinhDoanh}</dd></div><div><dt className="font-medium text-slate-500">Mã số thuế</dt><dd className="mt-1 text-slate-900">{application.MaSoThue}</dd></div><div><dt className="font-medium text-slate-500">Tệp giấy tờ</dt><dd className="mt-1 break-all text-blue-600"><a href={application.TepGiayTo} target="_blank" rel="noreferrer">{application.TepGiayTo}</a></dd></div></dl>
        {application.LyDoTuChoi ? <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"><strong>Lý do từ chối:</strong> {application.LyDoTuChoi}</div> : null}
        {pending ? <div className="space-y-4 border-t border-slate-200 pt-6"><div className="flex flex-wrap gap-3"><Button onClick={onApprove} disabled={approve.isPending || reject.isPending}>{approve.isPending ? 'Đang duyệt...' : 'Duyệt hồ sơ'}</Button></div><div><label htmlFor="reject-reason" className="block text-sm font-medium text-slate-700">Lý do từ chối <span className="text-red-600">*</span></label><textarea id="reject-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={4} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /><Button variant="danger" onClick={onReject} disabled={!reason.trim() || reject.isPending || approve.isPending}>{reject.isPending ? 'Đang từ chối...' : 'Từ chối hồ sơ'}</Button></div></div> : null}
      </div>
    </div>
  );
}