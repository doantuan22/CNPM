import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, ImagePlus } from 'lucide-react';
import { Button } from '../components/common/Button';
import {
  useRoomType,
  useUpdateRoomType,
  useReplaceRoomTypeAmenities,
  useUploadRoomTypeImage,
  useDeleteRoomTypeImage,
  useSetPrimaryRoomTypeImage,
  useRates,
  useBulkUpsertRates,
} from '../features/owner/hooks';
import { useAmenities } from '../features/amenities/hooks';
import {
  roomTypeFormSchema,
  RoomTypeFormSchemaValues,
  rateBulkFormSchema,
  RateBulkFormValues,
} from '../features/owner/schemas';
import { ApiError } from '../services/apiClient';
import { fileToDataUrl, formatCurrencyVND, toDateInputValue } from '../lib/utils';

export default function OwnerRoomTypeManagePage() {
  const { id } = useParams<{ id: string }>();
  const roomTypeId = Number(id);
  const roomTypeQuery = useRoomType(roomTypeId);
  const amenitiesQuery = useAmenities();
  const updateMutation = useUpdateRoomType(roomTypeId);
  const amenitiesMutation = useReplaceRoomTypeAmenities(roomTypeId);
  const uploadImageMutation = useUploadRoomTypeImage(roomTypeId);
  const deleteImageMutation = useDeleteRoomTypeImage(roomTypeId);
  const setPrimaryMutation = useSetPrimaryRoomTypeImage(roomTypeId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = toDateInputValue(new Date());
  const twoWeeksOut = toDateInputValue(new Date(Date.now() + 13 * 86400000));
  const [ratesRange, setRatesRange] = useState({ from: today, to: twoWeeksOut });
  const ratesQuery = useRates(roomTypeId, ratesRange.from, ratesRange.to);
  const bulkUpsertMutation = useBulkUpsertRates(roomTypeId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RoomTypeFormSchemaValues>({ resolver: zodResolver(roomTypeFormSchema) });

  const {
    register: registerRate,
    handleSubmit: handleRateSubmit,
    formState: { errors: rateErrors, isSubmitting: isRateSubmitting },
  } = useForm<RateBulkFormValues>({
    resolver: zodResolver(rateBulkFormSchema),
    defaultValues: { from: today, to: twoWeeksOut, giaPhong: 0, soLuongPhong: 0 },
  });

  useEffect(() => {
    if (roomTypeQuery.data) {
      reset({
        TenLoaiPhong: roomTypeQuery.data.TenLoaiPhong,
        SoGiuong: roomTypeQuery.data.SoGiuong,
        SucChua: roomTypeQuery.data.SucChua,
        DienTich: roomTypeQuery.data.DienTich,
        LoaiGiuong: roomTypeQuery.data.LoaiGiuong,
        MoTa: roomTypeQuery.data.MoTa ?? '',
      });
    }
  }, [roomTypeQuery.data, reset]);

  if (roomTypeQuery.isLoading) {
    return (
      <div className="flex justify-center py-16" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (roomTypeQuery.isError || !roomTypeQuery.data) {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
        {roomTypeQuery.error instanceof ApiError ? roomTypeQuery.error.message : 'Không tìm thấy loại phòng'}
      </div>
    );
  }

  const roomType = roomTypeQuery.data;
  const selectedAmenityIds = new Set(roomType.LOAI_PHONG_TIEN_NGHI.map((l) => l.MaTienNghi));

  const toggleAmenity = (amenityId: number) => {
    const next = new Set(selectedAmenityIds);
    if (next.has(amenityId)) next.delete(amenityId);
    else next.add(amenityId);
    amenitiesMutation.mutate(Array.from(next));
  };

  const onImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    await uploadImageMutation.mutateAsync(dataUrl);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onRateBulkSubmit = async (values: RateBulkFormValues) => {
    const rates: { NgayApDung: string; GiaPhong: number; SoLuongPhong: number }[] = [];
    const start = new Date(`${values.from}T00:00:00Z`);
    const end = new Date(`${values.to}T00:00:00Z`);
    for (let t = start.getTime(); t <= end.getTime(); t += 86400000) {
      rates.push({
        NgayApDung: new Date(t).toISOString().slice(0, 10),
        GiaPhong: values.giaPhong,
        SoLuongPhong: values.soLuongPhong,
      });
    }
    await bulkUpsertMutation.mutateAsync(rates);
    setRatesRange({ from: values.from, to: values.to });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to={`/owner/hotels/${roomType.MaKhachSan}`}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay lại khách sạn
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{roomType.TenLoaiPhong}</h1>
        <p className="text-sm text-slate-500">Trạng thái: {roomType.TrangThai}</p>
      </div>

      {/* Info form */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-lg font-semibold text-slate-900">Thông tin loại phòng</h2>
        {updateMutation.isSuccess && (
          <div role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Cập nhật thành công</div>
        )}
        <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="TenLoaiPhong" className="block text-sm font-medium text-slate-700">Tên loại phòng</label>
              <input id="TenLoaiPhong" {...register('TenLoaiPhong')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              {errors.TenLoaiPhong && <p className="mt-1 text-xs text-red-600">{errors.TenLoaiPhong.message}</p>}
            </div>
            <div>
              <label htmlFor="LoaiGiuong" className="block text-sm font-medium text-slate-700">Loại giường</label>
              <input id="LoaiGiuong" {...register('LoaiGiuong')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="SoGiuong" className="block text-sm font-medium text-slate-700">Số giường</label>
              <input id="SoGiuong" type="number" min={1} {...register('SoGiuong')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="SucChua" className="block text-sm font-medium text-slate-700">Sức chứa</label>
              <input id="SucChua" type="number" min={1} {...register('SucChua')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="DienTich" className="block text-sm font-medium text-slate-700">Diện tích (m²)</label>
              <input id="DienTich" type="number" min={1} step="0.1" {...register('DienTich')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="MoTa" className="block text-sm font-medium text-slate-700">Mô tả</label>
            <textarea id="MoTa" rows={3} {...register('MoTa')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => updateMutation.mutate({ TrangThai: roomType.TrangThai === 'Hoạt động' ? 'Ngừng bán' : 'Hoạt động' })}
            >
              {roomType.TrangThai === 'Hoạt động' ? 'Ngừng bán' : 'Mở bán lại'}
            </Button>
          </div>
        </form>
      </section>

      {/* Images */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Hình ảnh</h2>
          <label className="cursor-pointer">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageSelected} />
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
              <ImagePlus className="h-4 w-4" /> {uploadImageMutation.isPending ? 'Đang tải...' : 'Tải ảnh lên'}
            </span>
          </label>
        </div>
        {roomType.HINH_ANH_LOAI_PHONG.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có hình ảnh nào.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {roomType.HINH_ANH_LOAI_PHONG.map((img) => (
              <div key={img.MaHinhAnhLoaiPhong} className="group relative overflow-hidden rounded-lg border border-slate-200">
                <img src={img.URL} alt="" className="h-28 w-full object-cover" />
                {img.LaAnhDaiDien && (
                  <span className="absolute left-1 top-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">Đại diện</span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 px-1.5 py-1 opacity-0 transition group-hover:opacity-100">
                  {!img.LaAnhDaiDien && (
                    <button type="button" onClick={() => setPrimaryMutation.mutate(img.MaHinhAnhLoaiPhong)} className="text-[10px] text-white hover:underline">
                      Đặt đại diện
                    </button>
                  )}
                  <button type="button" onClick={() => deleteImageMutation.mutate(img.MaHinhAnhLoaiPhong)} className="ml-auto text-white hover:text-red-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Amenities */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-lg font-semibold text-slate-900">Tiện nghi</h2>
        {amenitiesQuery.data && amenitiesQuery.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {amenitiesQuery.data.map((a) => (
              <label key={a.MaTienNghi} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={selectedAmenityIds.has(a.MaTienNghi)}
                  onChange={() => toggleAmenity(a.MaTienNghi)}
                  className="rounded border-slate-300"
                />
                {a.TenTienNghi}
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Chưa có danh mục tiện nghi.</p>
        )}
      </section>

      {/* Rates / inventory */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-lg font-semibold text-slate-900">Giá &amp; quỹ phòng theo ngày</h2>

        {bulkUpsertMutation.isSuccess && (
          <div role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Cập nhật giá/quỹ phòng thành công</div>
        )}
        {bulkUpsertMutation.isError && (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {bulkUpsertMutation.error instanceof ApiError ? bulkUpsertMutation.error.message : 'Cập nhật thất bại'}
          </div>
        )}

        <form onSubmit={handleRateSubmit(onRateBulkSubmit)} noValidate className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-4">
          <div>
            <label htmlFor="rate-from" className="block text-xs font-medium text-slate-600">Từ ngày</label>
            <input id="rate-from" type="date" {...registerRate('from')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="rate-to" className="block text-xs font-medium text-slate-600">Đến ngày</label>
            <input id="rate-to" type="date" {...registerRate('to')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            {rateErrors.to && <p className="mt-1 text-xs text-red-600">{rateErrors.to.message}</p>}
          </div>
          <div>
            <label htmlFor="rate-gia" className="block text-xs font-medium text-slate-600">Giá / đêm (đ)</label>
            <input id="rate-gia" type="number" min={0} {...registerRate('giaPhong')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            {rateErrors.giaPhong && <p className="mt-1 text-xs text-red-600">{rateErrors.giaPhong.message}</p>}
          </div>
          <div>
            <label htmlFor="rate-soluong" className="block text-xs font-medium text-slate-600">Số phòng mở bán</label>
            <input id="rate-soluong" type="number" min={0} {...registerRate('soLuongPhong')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            {rateErrors.soLuongPhong && <p className="mt-1 text-xs text-red-600">{rateErrors.soLuongPhong.message}</p>}
          </div>
          <div className="col-span-2 sm:col-span-4">
            <Button type="submit" size="sm" disabled={isRateSubmitting || bulkUpsertMutation.isPending}>
              {bulkUpsertMutation.isPending ? 'Đang áp dụng...' : 'Áp dụng cho khoảng ngày này'}
            </Button>
          </div>
        </form>

        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-700">
            Bảng giá hiện tại ({ratesRange.from} → {ratesRange.to})
          </h3>
          {ratesQuery.isLoading ? (
            <div className="flex justify-center py-6" role="status" aria-live="polite">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            </div>
          ) : ratesQuery.data && ratesQuery.data.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có dữ liệu giá cho khoảng ngày này.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Ngày</th>
                    <th className="px-3 py-2">Giá</th>
                    <th className="px-3 py-2">Số lượng</th>
                    <th className="px-3 py-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ratesQuery.data?.map((rate) => (
                    <tr key={rate.MaQuyPhong}>
                      <td className="px-3 py-2">{rate.NgayApDung.slice(0, 10)}</td>
                      <td className="px-3 py-2">{formatCurrencyVND(rate.GiaPhong)}</td>
                      <td className="px-3 py-2">{rate.SoLuongPhong}</td>
                      <td className="px-3 py-2">{rate.TrangThai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
