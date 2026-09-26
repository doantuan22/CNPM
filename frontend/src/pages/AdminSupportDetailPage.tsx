import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useAdminSupportDetail, useAdminUpdateSupportRequest } from '../features/support/hooks';
import { supportStatusBadgeClass } from '../features/support/status';
import { cn } from '../lib/utils';
import { ApiError } from '../services/apiClient';

export default function AdminSupportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const requestId = Number(id);
  const requestQuery = useAdminSupportDetail(requestId);
  const updateMutation = useAdminUpdateSupportRequest();
  const [ketQuaXuLy, setKetQuaXuLy] = useState('');

  if (requestQuery.isLoading) {
    return (
      <div className="flex justify-center py-16" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (requestQuery.isError || !requestQuery.data) {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
        {requestQuery.error instanceof ApiError ? requestQuery.error.message : 'Không tìm thấy yêu cầu'}
      </div>
    );
  }

  const r = requestQuery.data;
  const isResolved = r.TrangThai === 'Đã xử lý';

  const claim = () => updateMutation.mutate({ id: requestId, payload: { trangThai: 'Đang xử lý' } });
  const resolve = () => updateMutation.mutate({ id: requestId, payload: { trangThai: 'Đã xử lý', ketQuaXuLy: ketQuaXuLy.trim() } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/admin/support">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay lại danh sách
        </Link>
      </Button>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{r.TieuDe}</h1>
            <p className="mt-1 text-xs text-slate-500">
              {r.LoaiYeuCau} · {r.TAI_KHOAN_YEU_CAU_HO_TRO_MaTaiKhoanKhachHangToTAI_KHOAN.HoTen} ({r.TAI_KHOAN_YEU_CAU_HO_TRO_MaTaiKhoanKhachHangToTAI_KHOAN.Email})
              {r.DAT_PHONG && <> · Đơn {r.DAT_PHONG.MaXacNhanDatPhong}</>}
            </p>
            <p className="text-xs text-slate-500">Gửi ngày {new Date(r.NgayTao).toLocaleString('vi-VN')}</p>
          </div>
          <span className={cn('rounded-full px-3 py-1 text-sm font-medium', supportStatusBadgeClass(r.TrangThai))}>{r.TrangThai}</span>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="mb-1 text-xs font-medium text-slate-600">Nội dung</p>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{r.NoiDung}</p>
        </div>

        {r.TAI_KHOAN_YEU_CAU_HO_TRO_MaTaiKhoanXuLyToTAI_KHOAN && (
          <p className="text-xs text-slate-500">Người xử lý: {r.TAI_KHOAN_YEU_CAU_HO_TRO_MaTaiKhoanXuLyToTAI_KHOAN.HoTen}</p>
        )}

        {isResolved ? (
          <div className="rounded-lg bg-green-50 p-3">
            <p className="mb-1 text-xs font-medium text-green-800">
              Kết quả xử lý{r.NgayXuLy && ` (${new Date(r.NgayXuLy).toLocaleString('vi-VN')})`}
            </p>
            <p className="whitespace-pre-wrap text-sm text-green-900">{r.KetQuaXuLy}</p>
          </div>
        ) : (
          <div className="space-y-3 border-t border-slate-100 pt-4">
            {updateMutation.isError && (
              <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {updateMutation.error instanceof ApiError ? updateMutation.error.message : 'Không thể cập nhật yêu cầu'}
              </div>
            )}

            {r.TrangThai === 'Mới' && (
              <Button variant="outline" onClick={claim} disabled={updateMutation.isPending}>
                Tiếp nhận
              </Button>
            )}

            <div>
              <label htmlFor="ketquaxuly" className="mb-1 block text-xs font-medium text-slate-600">
                Kết quả xử lý
              </label>
              <textarea
                id="ketquaxuly"
                rows={4}
                value={ketQuaXuLy}
                onChange={(e) => setKetQuaXuLy(e.target.value)}
                placeholder="Nhập kết quả/phản hồi cho khách hàng..."
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <Button onClick={resolve} disabled={updateMutation.isPending || !ketQuaXuLy.trim()}>
              {updateMutation.isPending ? 'Đang lưu...' : 'Đánh dấu đã xử lý'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
