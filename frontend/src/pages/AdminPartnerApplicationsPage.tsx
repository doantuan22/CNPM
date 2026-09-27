import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminPartnerApplications } from '../features/partners/hooks';
import { ApiError } from '../services/apiClient';

const statuses = ['', 'Chờ duyệt', 'Đã duyệt', 'Từ chối'];

export default function AdminPartnerApplicationsPage() {
  const [status, setStatus] = useState('Chờ duyệt');
  const query = useAdminPartnerApplications(status || undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Duyệt hồ sơ đối tác</h1>
        <p className="text-sm text-slate-500">Xem và xử lý đăng ký kinh doanh khách sạn mới</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="partner-status" className="text-sm font-medium text-slate-700">Trạng thái</label>
        <select id="partner-status" value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {statuses.map((value) => <option key={value} value={value}>{value || 'Tất cả trạng thái'}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        {query.isLoading ? (
          <div className="flex justify-center py-16" role="status"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" /></div>
        ) : query.isError ? (
          <div role="alert" className="px-6 py-10 text-center text-sm text-red-700">{query.error instanceof ApiError ? query.error.message : 'Không thể tải hồ sơ đối tác'}</div>
        ) : query.data?.items.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">Không có hồ sơ phù hợp</div>
        ) : (
          <table className="min-w-[720px] w-full text-left text-sm">
            <caption className="sr-only">Danh sách hồ sơ đối tác</caption>
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Người nộp</th><th className="px-4 py-3">Mã hồ sơ</th><th className="px-4 py-3">Ngày nộp</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3" /></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {query.data?.items.map((application) => <tr key={application.MaHoSoDoiTac} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{application.TAI_KHOAN_HO_SO_DOI_TAC_MaTaiKhoanToTAI_KHOAN.HoTen}</td>
                <td className="px-4 py-3 text-slate-700">#{application.MaHoSoDoiTac}</td>
                <td className="px-4 py-3 text-slate-700">{new Date(application.NgayNop).toLocaleString('vi-VN')}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">{application.TrangThaiDuyet}</span></td>
                <td className="px-4 py-3 text-right"><Link to={`/admin/partner-applications/${application.MaHoSoDoiTac}`} className="font-medium text-blue-600 hover:underline">Chi tiết</Link></td>
              </tr>)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}