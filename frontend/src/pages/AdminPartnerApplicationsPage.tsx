import { Link } from 'react-router-dom';
import { useAdminPartnerApplications } from '../features/partners/hooks';
import { ApiError } from '../services/apiClient';
import { StatusBadge } from '../components/domain/StatusBadge';
import { formatDateTimeVi } from '../lib/utils';
import { useListParams } from '../hooks/useListParams';

const FILTER_DEFAULTS = { status: 'Chờ duyệt' };

export default function AdminPartnerApplicationsPage() {
  const { values, setValue } = useListParams(FILTER_DEFAULTS);
  const status = values.status;
  const setStatus = (value: string) => setValue('status', value);
  const query = useAdminPartnerApplications(status === 'ALL' ? undefined : status);

  return (
    <div className="admin-list-page flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">Hồ sơ đăng ký</h1>
          <p className="text-sm text-slate-500 mt-0.5">Thẩm định tính pháp lý hồ sơ đối tác chủ khách sạn và cơ sở lưu trú trước khi cho phép mở bán phòng.</p>
        </div>
      </div>

      <div className="bg-white rounded-[16px] border border-border shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-xl text-sm font-bold bg-primary-50 text-primary-700 border border-primary-100 transition shadow-xs">
              Đăng ký đối tác
            </div>
          </div>
          
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            {['ALL', 'Chờ duyệt', 'Đã duyệt', 'Từ chối'].map((st) => (
              <button
                key={st}
                onClick={() => setStatus(st)}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  status === st ? 'bg-white text-heading shadow-sm font-bold' : 'text-slate-600 hover:text-heading font-semibold'
                }`}
              >
                {st === 'ALL' ? 'Tất cả' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[16px] border border-border shadow-sm overflow-hidden flex flex-col">
        {query.isLoading ? (
          <div className="flex justify-center py-16" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span className="sr-only">Đang tải...</span></div>
        ) : query.isError ? (
          <div role="alert" className="px-6 py-10 text-center text-sm text-red-700">
            {query.error instanceof ApiError ? query.error.message : 'Không thể tải hồ sơ đối tác'}
          </div>
        ) : query.data?.items.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <i className="ph ph-files text-[28px]"></i>
            </div>
            <h4 className="text-sm font-bold text-heading">Không có hồ sơ đăng ký nào phù hợp</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">Chưa có hồ sơ với trạng thái đã chọn.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Mã hồ sơ</th>
                  <th className="py-3.5 px-4">Người đại diện</th>
                  <th className="py-3.5 px-4 text-center">Ngày nộp</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {query.data?.items.map((application) => (
                  <tr key={application.MaHoSoDoiTac} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-primary-600">
                      #{application.MaHoSoDoiTac}
                    </td>
                    <td className="py-4 px-4 font-bold text-heading">
                      {application.TAI_KHOAN_HO_SO_DOI_TAC_MaTaiKhoanToTAI_KHOAN.HoTen}
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-[11px] text-slate-500">
                      {formatDateTimeVi(application.NgayNop)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge domain="partnerApplication" status={application.TrangThaiDuyet} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Link to={`/admin/partner-applications/${application.MaHoSoDoiTac}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 transition border border-primary-200/60">
                        Thẩm định
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
