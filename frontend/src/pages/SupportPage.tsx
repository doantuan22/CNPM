import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, Plus } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useMyBookings } from '../features/bookings/hooks';
import { useCreateSupportRequest, useMySupportRequests } from '../features/support/hooks';
import { supportStatusBadgeClass } from '../features/support/status';
import { cn } from '../lib/utils';
import { ApiError } from '../services/apiClient';

const SUPPORT_TYPES = ['Hỗ trợ', 'Khiếu nại'];

export default function SupportPage() {
  const requestsQuery = useMySupportRequests();
  const bookingsQuery = useMyBookings();
  const createMutation = useCreateSupportRequest();

  const [showForm, setShowForm] = useState(false);
  const [loaiYeuCau, setLoaiYeuCau] = useState(SUPPORT_TYPES[0]);
  const [tieuDe, setTieuDe] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [maDatPhong, setMaDatPhong] = useState('');

  const resetForm = () => {
    setLoaiYeuCau(SUPPORT_TYPES[0]);
    setTieuDe('');
    setNoiDung('');
    setMaDatPhong('');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { loaiYeuCau, tieuDe: tieuDe.trim(), noiDung: noiDung.trim(), maDatPhong: maDatPhong ? Number(maDatPhong) : undefined },
      { onSuccess: () => { resetForm(); setShowForm(false); } }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hỗ trợ & khiếu nại</h1>
          <p className="text-sm text-slate-500">Gửi yêu cầu hỗ trợ hoặc khiếu nại và theo dõi trạng thái xử lý</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-1.5 h-4 w-4" /> Tạo yêu cầu
        </Button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="support-type" className="mb-1 block text-xs font-medium text-slate-600">
                Loại yêu cầu
              </label>
              <select
                id="support-type"
                value={loaiYeuCau}
                onChange={(e) => setLoaiYeuCau(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {SUPPORT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="support-booking" className="mb-1 block text-xs font-medium text-slate-600">
                Đặt phòng liên quan (không bắt buộc)
              </label>
              <select
                id="support-booking"
                value={maDatPhong}
                onChange={(e) => setMaDatPhong(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Không liên quan đặt phòng nào</option>
                {bookingsQuery.data?.map((b) => (
                  <option key={b.MaDatPhong} value={b.MaDatPhong}>{b.MaXacNhanDatPhong} — {b.TenKhachSan}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="support-title" className="mb-1 block text-xs font-medium text-slate-600">
              Tiêu đề
            </label>
            <input
              id="support-title"
              type="text"
              required
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="support-content" className="mb-1 block text-xs font-medium text-slate-600">
              Nội dung
            </label>
            <textarea
              id="support-content"
              required
              rows={4}
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {createMutation.isError && (
            <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {createMutation.error instanceof ApiError ? createMutation.error.message : 'Không thể gửi yêu cầu'}
            </div>
          )}

          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
        </form>
      )}

      {requestsQuery.isLoading ? (
        <div className="flex justify-center py-16" role="status" aria-live="polite">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      ) : requestsQuery.isError ? (
        <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {requestsQuery.error instanceof ApiError ? requestsQuery.error.message : 'Không thể tải danh sách yêu cầu'}
        </div>
      ) : !requestsQuery.data || requestsQuery.data.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <LifeBuoy className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Chưa có yêu cầu nào</h2>
          <p className="mt-2 text-sm text-slate-500">Bạn chưa gửi yêu cầu hỗ trợ hoặc khiếu nại nào.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requestsQuery.data.map((r) => (
            <Link
              key={r.MaYeuCauHoTro}
              to={`/support/${r.MaYeuCauHoTro}`}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{r.TieuDe}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', supportStatusBadgeClass(r.TrangThai))}>
                    {r.TrangThai}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {r.LoaiYeuCau} · {new Date(r.NgayTao).toLocaleDateString('vi-VN')}
                  {r.DAT_PHONG && <> · Đơn {r.DAT_PHONG.MaXacNhanDatPhong}</>}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
