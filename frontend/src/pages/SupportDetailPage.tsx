import { Link, useParams } from 'react-router-dom';
import { useMySupportRequest } from '../features/support/hooks';
import { ApiError } from '../services/apiClient';

function getBadgeClass(status: string) {
  switch (status) {
    case 'Mới tiếp nhận':
      return 'status-new';
    case 'Đang xử lý':
      return 'status-processing';
    case 'Đã xử lý':
      return 'status-resolved';
    default:
      return 'status-new';
  }
}

export default function SupportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const requestQuery = useMySupportRequest(Number(id));

  if (requestQuery.isLoading) {
    return <div className="flex justify-center py-16"><div className="spinner"></div></div>;
  }

  if (requestQuery.isError || !requestQuery.data) {
    return (
      <div role="alert" className="mx-auto max-w-md mt-8 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
        {requestQuery.error instanceof ApiError ? requestQuery.error.message : 'Không tìm thấy yêu cầu'}
      </div>
    );
  }

  const r = requestQuery.data;

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <Link to="/support" className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại danh sách yêu cầu</span>
      </Link>

      <div className="card card-body max-w-3xl">
        <div className="flex justify-between items-start gap-3 mb-5 pb-4 border-b border-border flex-wrap">
          <div>
            <h1 className="text-[20px] font-bold text-heading">{r.TieuDe}</h1>
            <p className="mt-1 text-[13px] text-muted">
              {r.LoaiYeuCau} · Gửi lúc {new Date(r.NgayTao).toLocaleString('vi-VN')}
            </p>
          </div>
          <span className={`status-badge ${getBadgeClass(r.TrangThai)}`}>{r.TrangThai}</span>
        </div>

        <div className="space-y-4 text-sm text-body">
          {r.DAT_PHONG && (
             <div><strong>Đơn liên quan:</strong> #{r.DAT_PHONG.MaXacNhanDatPhong}</div>
          )}
          
          <div>
            <strong className="block mb-1 text-heading">Nội dung chi tiết:</strong>
            <p className="whitespace-pre-wrap leading-relaxed">{r.NoiDung}</p>
          </div>
        </div>

        {r.KetQuaXuLy && (
          <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-lg p-4">
            <h4 className="text-sm font-bold text-emerald-800 mb-1 flex items-center gap-2">
              <i className="ph-fill ph-check-circle text-emerald-600"></i>
              Kết quả xử lý {r.NgayXuLy && <span className="font-normal opacity-80">({new Date(r.NgayXuLy).toLocaleString('vi-VN')})</span>}
            </h4>
            <p className="whitespace-pre-wrap text-sm text-emerald-900 leading-relaxed pl-6">{r.KetQuaXuLy}</p>
          </div>
        )}

      </div>
    </div>
  );
}
