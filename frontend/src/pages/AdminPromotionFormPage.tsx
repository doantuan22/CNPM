import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { useCreatePromotion, usePromotionDetail, useSetPromotionStatus, useUpdatePromotion } from '../features/promotions/hooks';
import { promotionStatusBadgeClass } from '../features/promotions/status';
import { cn } from '../lib/utils';
import { ApiError } from '../services/apiClient';
import type { PromotionFormValues } from '../features/promotions/types';

const DISCOUNT_TYPES = ['Phần trăm', 'Số tiền cố định'];

const emptyForm: PromotionFormValues = {
  MaCode: '',
  LoaiGiamGia: DISCOUNT_TYPES[0],
  GiaTriGiam: 10,
  GiaTriDonToiThieu: 0,
  MucGiamToiDa: 0,
  SoLuongGioiHan: 0,
  NgayBatDau: '',
  NgayKetThuc: '',
};

export default function AdminPromotionFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined;
  const promotionId = Number(id);
  const navigate = useNavigate();

  const detailQuery = usePromotionDetail(isEdit ? promotionId : -1);
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();
  const statusMutation = useSetPromotionStatus();

  const [form, setForm] = useState<PromotionFormValues>(emptyForm);

  useEffect(() => {
    if (detailQuery.data) {
      setForm({
        MaCode: detailQuery.data.MaCode,
        LoaiGiamGia: detailQuery.data.LoaiGiamGia,
        GiaTriGiam: detailQuery.data.GiaTriGiam,
        GiaTriDonToiThieu: detailQuery.data.GiaTriDonToiThieu,
        MucGiamToiDa: detailQuery.data.MucGiamToiDa,
        SoLuongGioiHan: detailQuery.data.SoLuongGioiHan,
        NgayBatDau: detailQuery.data.NgayBatDau.slice(0, 10),
        NgayKetThuc: detailQuery.data.NgayKetThuc.slice(0, 10),
      });
    }
  }, [detailQuery.data]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate({ id: promotionId, payload: form });
    } else {
      createMutation.mutate(form, { onSuccess: (promo) => navigate(`/admin/promotions/${promo.MaKhuyenMai}`, { replace: true }) });
    }
  };

  const mutation = isEdit ? updateMutation : createMutation;

  if (isEdit && detailQuery.isLoading) {
    return (
      <div className="flex justify-center py-16" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (isEdit && (detailQuery.isError || !detailQuery.data)) {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
        {detailQuery.error instanceof ApiError ? detailQuery.error.message : 'Không tìm thấy mã khuyến mãi'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/admin/promotions">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay lại danh sách
        </Link>
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{isEdit ? 'Chỉnh sửa mã khuyến mãi' : 'Tạo mã khuyến mãi mới'}</h1>
        {isEdit && detailQuery.data && (
          <span className={cn('rounded-full px-3 py-1 text-sm font-medium', promotionStatusBadgeClass(detailQuery.data.TrangThai))}>
            {detailQuery.data.TrangThai}
          </span>
        )}
      </div>

      {isEdit && detailQuery.data && (
        <p className="text-xs text-slate-500">Đã sử dụng: {detailQuery.data.SoLuongDaSuDung} lượt</p>
      )}

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <label htmlFor="promo-code" className="mb-1 block text-xs font-medium text-slate-600">Mã khuyến mãi</label>
          <input
            id="promo-code"
            type="text"
            required
            value={form.MaCode}
            onChange={(e) => setForm((f) => ({ ...f, MaCode: e.target.value.toUpperCase() }))}
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="promo-type" className="mb-1 block text-xs font-medium text-slate-600">Loại giảm</label>
            <select
              id="promo-type"
              value={form.LoaiGiamGia}
              onChange={(e) => setForm((f) => ({ ...f, LoaiGiamGia: e.target.value }))}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {DISCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="promo-value" className="mb-1 block text-xs font-medium text-slate-600">
              Giá trị giảm {form.LoaiGiamGia === 'Phần trăm' ? '(%, tối đa 100)' : '(VNĐ)'}
            </label>
            <input
              id="promo-value"
              type="number"
              required
              min={1}
              max={form.LoaiGiamGia === 'Phần trăm' ? 100 : undefined}
              value={form.GiaTriGiam}
              onChange={(e) => setForm((f) => ({ ...f, GiaTriGiam: Number(e.target.value) }))}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="promo-min" className="mb-1 block text-xs font-medium text-slate-600">Giá trị đơn tối thiểu (VNĐ)</label>
            <input
              id="promo-min"
              type="number"
              min={0}
              value={form.GiaTriDonToiThieu}
              onChange={(e) => setForm((f) => ({ ...f, GiaTriDonToiThieu: Number(e.target.value) }))}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="promo-max" className="mb-1 block text-xs font-medium text-slate-600">Mức giảm tối đa (VNĐ, 0 = không giới hạn)</label>
            <input
              id="promo-max"
              type="number"
              min={0}
              value={form.MucGiamToiDa}
              onChange={(e) => setForm((f) => ({ ...f, MucGiamToiDa: Number(e.target.value) }))}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="promo-limit" className="mb-1 block text-xs font-medium text-slate-600">Số lượng giới hạn (0 = không giới hạn)</label>
          <input
            id="promo-limit"
            type="number"
            min={0}
            value={form.SoLuongGioiHan}
            onChange={(e) => setForm((f) => ({ ...f, SoLuongGioiHan: Number(e.target.value) }))}
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="promo-start" className="mb-1 block text-xs font-medium text-slate-600">Ngày bắt đầu</label>
            <input
              id="promo-start"
              type="date"
              required
              value={form.NgayBatDau}
              onChange={(e) => setForm((f) => ({ ...f, NgayBatDau: e.target.value }))}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="promo-end" className="mb-1 block text-xs font-medium text-slate-600">Ngày kết thúc</label>
            <input
              id="promo-end"
              type="date"
              required
              value={form.NgayKetThuc}
              onChange={(e) => setForm((f) => ({ ...f, NgayKetThuc: e.target.value }))}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {mutation.isError && (
          <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {mutation.error instanceof ApiError ? mutation.error.message : 'Không thể lưu mã khuyến mãi'}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo mã'}
          </Button>
          {isEdit && detailQuery.data && (
            <Button
              type="button"
              variant="outline"
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate({ id: promotionId, active: detailQuery.data!.TrangThai !== 'Hoạt động' })}
            >
              {detailQuery.data.TrangThai === 'Hoạt động' ? 'Tắt mã' : 'Bật mã'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
