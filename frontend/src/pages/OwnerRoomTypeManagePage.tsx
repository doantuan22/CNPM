import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, Link } from 'react-router-dom';
import {
  useRoomType,
  useUpdateRoomType,
  useDeactivateRoomType,
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
import { fileToDataUrl, imageFileError, formatCurrencyVND, toDateInputValue, cn } from '../lib/utils';

function getStatusBadgeClass(status: string) {
  return status === 'Hoạt động' ? 'status-active' : 'status-suspended';
}

export default function OwnerRoomTypeManagePage() {
  const { id } = useParams<{ id: string }>();
  const roomTypeId = Number(id);
  const roomTypeQuery = useRoomType(roomTypeId);
  const amenitiesQuery = useAmenities();
  const updateMutation = useUpdateRoomType(roomTypeId);
  const deactivateMutation = useDeactivateRoomType(roomTypeId);
  const amenitiesMutation = useReplaceRoomTypeAmenities(roomTypeId);
  const uploadImageMutation = useUploadRoomTypeImage(roomTypeId);
  const deleteImageMutation = useDeleteRoomTypeImage(roomTypeId);
  const setPrimaryMutation = useSetPrimaryRoomTypeImage(roomTypeId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState<string | null>(null);

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
    return <div className="flex justify-center py-16" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span className="sr-only">Đang tải...</span></div>;
  }

  if (roomTypeQuery.isError || !roomTypeQuery.data) {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700 border border-red-200">
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
    const validationError = imageFileError(file);
    if (validationError) { setImageError(validationError); e.target.value = ''; return; }
    setImageError(null);
    try {
      await uploadImageMutation.mutateAsync(await fileToDataUrl(file));
    } catch {
      // handled
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
    <div className="flex flex-col gap-5 max-w-[1040px] mx-auto w-full">
      <Link to={`/owner/hotels/${roomType.MaKhachSan}`} className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại khách sạn</span>
      </Link>

      <div className="flex justify-between items-center flex-wrap gap-3 bg-white border border-border rounded-[14px] px-6 py-4">
        <div>
          <h1 className="text-[20px] font-bold text-heading mb-0.5">Chỉnh sửa: {roomType.TenLoaiPhong}</h1>
          <p className="text-[13px] text-muted">Cập nhật thông số kỹ thuật, sức chứa, tiện ích và thư viện ảnh của loại phòng này.</p>
        </div>
        <div className={`status-badge ${getStatusBadgeClass(roomType.TrangThai)}`}>{roomType.TrangThai}</div>
      </div>

      <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))} noValidate className="flex flex-col gap-5">
        {updateMutation.isError && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {updateMutation.error instanceof ApiError ? updateMutation.error.message : 'Cập nhật thất bại'}
          </div>
        )}

        <section className="bg-white border border-border rounded-[16px] p-7 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-heading flex items-center gap-2 mb-1">📐 Thông số kỹ thuật & Cấu hình</h2>
            <p className="text-sm text-muted">Tên gọi thương mại, diện tích, sức chứa và loại giường tiêu chuẩn</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="md:col-span-2 lg:col-span-3">
              <label htmlFor="owner-room-type-manage-TenLoaiPhong" className="form-label">Tên loại phòng <span className="text-red-500">*</span></label>
              <input id="owner-room-type-manage-TenLoaiPhong" type="text" className={cn("input", errors.TenLoaiPhong && "border-red-500")} {...register('TenLoaiPhong')} />
              {errors.TenLoaiPhong && <p className="text-xs text-red-500 mt-1">{errors.TenLoaiPhong.message}</p>}
            </div>

            <div>
              <label htmlFor="owner-room-type-manage-DienTich" className="form-label">Diện tích phòng (m²) <span className="text-red-500">*</span></label>
              <input id="owner-room-type-manage-DienTich" type="number" step="0.1" className={cn("input", errors.DienTich && "border-red-500")} {...register('DienTich', { valueAsNumber: true })} />
              {errors.DienTich && <p className="text-xs text-red-500 mt-1">{errors.DienTich.message}</p>}
            </div>

            <div>
              <label htmlFor="owner-room-type-manage-SucChua" className="form-label">Sức chứa tối đa (Khách) <span className="text-red-500">*</span></label>
              <input id="owner-room-type-manage-SucChua" type="number" className={cn("input", errors.SucChua && "border-red-500")} {...register('SucChua', { valueAsNumber: true })} />
              {errors.SucChua && <p className="text-xs text-red-500 mt-1">{errors.SucChua.message}</p>}
            </div>

            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="owner-room-type-manage-LoaiGiuong" className="form-label">Loại giường <span className="text-red-500">*</span></label>
                <input id="owner-room-type-manage-LoaiGiuong" type="text" className={cn("input", errors.LoaiGiuong && "border-red-500")} {...register('LoaiGiuong')} />
                {errors.LoaiGiuong && <p className="text-xs text-red-500 mt-1">{errors.LoaiGiuong.message}</p>}
              </div>

              <div>
                <label htmlFor="owner-room-type-manage-SoGiuong" className="form-label">Số lượng giường <span className="text-red-500">*</span></label>
                <input id="owner-room-type-manage-SoGiuong" type="number" className={cn("input", errors.SoGiuong && "border-red-500")} {...register('SoGiuong', { valueAsNumber: true })} />
                {errors.SoGiuong && <p className="text-xs text-red-500 mt-1">{errors.SoGiuong.message}</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-border rounded-[16px] p-7 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-heading flex items-center gap-2 mb-1">📝 Giới thiệu & Mô tả không gian</h2>
            <p className="text-sm text-muted">Nội dung hiển thị cho du khách khi xem chi tiết loại phòng này</p>
          </div>
          <div>
            <textarea rows={4} className={cn("textarea", errors.MoTa && "border-red-500")} {...register('MoTa')}></textarea>
          </div>
        </section>

        <div className="flex justify-between items-center flex-wrap gap-3 bg-white border border-border rounded-[14px] px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button type="submit" disabled={!isDirty || updateMutation.isPending} className="btn btn-primary">
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thông tin loại phòng'}
            </button>
            {roomType.TrangThai === 'Hoạt động' && (
              <button 
                type="button" 
                className="btn btn-danger-outline" 
                disabled={deactivateMutation.isPending} 
                onClick={() => { if (window.confirm('Ngừng bán loại phòng này? Booking lịch sử sẽ được giữ lại.')) deactivateMutation.mutate(); }}
              >
                {deactivateMutation.isPending ? 'Đang xử lý...' : 'Ngừng bán'}
              </button>
            )}
          </div>
        </div>
      </form>

      <section className="bg-white border border-border rounded-[16px] p-7 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-heading flex items-center gap-2 mb-1">✨ Tiện nghi phòng sẵn có</h2>
          <p className="text-sm text-muted">Tích chọn các tiện ích được phục vụ trong loại phòng này</p>
        </div>

        {amenitiesQuery.data && amenitiesQuery.data.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {amenitiesQuery.data.map((a) => (
              <label 
                key={a.MaTienNghi} 
                className={cn(
                  "flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer select-none transition-all",
                  selectedAmenityIds.has(a.MaTienNghi) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-border hover:bg-slate-100"
                )}
              >
                <input 
                  type="checkbox" 
                  checked={selectedAmenityIds.has(a.MaTienNghi)} 
                  onChange={() => toggleAmenity(a.MaTienNghi)} 
                  className="w-4 h-4 accent-primary" 
                />
                <span className="text-[13px] font-medium text-heading">{a.TenTienNghi}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Chưa có danh mục tiện nghi.</p>
        )}
      </section>

      <section className="bg-white border border-border rounded-[16px] p-7 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-bold text-heading flex items-center gap-2 mb-1">📸 Thư viện hình ảnh loại phòng</h2>
            <p className="text-sm text-muted">Ảnh độ nét cao. Ảnh đầu tiên là ảnh đại diện</p>
          </div>
          <div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageSelected} />
            <button type="button" className="btn btn-outline btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploadImageMutation.isPending}>
              <i className="ph ph-upload-simple"></i> {uploadImageMutation.isPending ? 'Đang tải...' : 'Tải ảnh lên'}
            </button>
          </div>
        </div>

        {(imageError || uploadImageMutation.isError) && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 mb-4">
            {imageError || (uploadImageMutation.error instanceof ApiError ? uploadImageMutation.error.message : 'Không thể tải ảnh')}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {roomType.HINH_ANH_LOAI_PHONG.map((img) => (
            <div key={img.MaHinhAnhLoaiPhong} className="relative h-[110px] rounded-lg overflow-hidden border border-border bg-slate-100 group">
              <img src={img.URL} alt="Room img" className="w-full h-full object-cover" />
              {img.LaAnhDaiDien && (
                <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[4px]">Ảnh đại diện</span>
              )}
              {!img.LaAnhDaiDien && (
                <button type="button" onClick={() => setPrimaryMutation.mutate(img.MaHinhAnhLoaiPhong)} disabled={setPrimaryMutation.isPending} className="absolute bottom-1.5 left-1.5 bg-[#172033bf] text-white border-none text-[10px] px-1.5 py-1 rounded-[4px] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  Đặt làm bìa
                </button>
              )}
              <button type="button" onClick={() => { if (window.confirm('Xóa ảnh này?')) deleteImageMutation.mutate(img.MaHinhAnhLoaiPhong); }} disabled={deleteImageMutation.isPending} className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full bg-black/60 text-white border-none flex items-center justify-center text-[12px] cursor-pointer hover:bg-red-500">
                <i className="ph ph-x"></i>
              </button>
            </div>
          ))}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="h-[110px] border-[1.5px] border-dashed border-primary bg-[#F5F9FF] rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#EBF3FF] transition-colors"
          >
            <i className="ph-fill ph-plus-circle text-primary text-[20px]"></i>
            <span className="text-[12px] font-bold text-primary">Thêm ảnh</span>
          </div>
        </div>
      </section>

      {/* Inventory & Pricing */}
      <section className="bg-white border border-border rounded-[16px] p-7 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-heading flex items-center gap-2 mb-1">📅 Giá & quỹ phòng theo ngày</h2>
          <p className="text-sm text-muted">Thiết lập giá và số lượng mở bán cho từng ngày.</p>
        </div>

        {bulkUpsertMutation.isSuccess && (
          <div role="status" className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 mb-4">Cập nhật thành công</div>
        )}

        <form onSubmit={handleRateSubmit(onRateBulkSubmit)} className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-border rounded-xl p-5 mb-6">
          <div>
            <label htmlFor="owner-room-type-manage-from" className="form-label">Từ ngày <span className="text-red-500">*</span></label>
            <input id="owner-room-type-manage-from" type="date" className={cn("input", rateErrors.from && "border-red-500")} {...registerRate('from')} />
          </div>
          <div>
            <label htmlFor="owner-room-type-manage-to" className="form-label">Đến ngày <span className="text-red-500">*</span></label>
            <input id="owner-room-type-manage-to" type="date" className={cn("input", rateErrors.to && "border-red-500")} {...registerRate('to')} />
          </div>
          <div>
            <label htmlFor="owner-room-type-manage-giaPhong" className="form-label">Giá / đêm (VND) <span className="text-red-500">*</span></label>
            <input id="owner-room-type-manage-giaPhong" type="number" min="0" className={cn("input", rateErrors.giaPhong && "border-red-500")} {...registerRate('giaPhong', { valueAsNumber: true })} />
          </div>
          <div>
            <label htmlFor="owner-room-type-manage-soLuongPhong" className="form-label">Phòng trống bán <span className="text-red-500">*</span></label>
            <input id="owner-room-type-manage-soLuongPhong" type="number" min="0" className={cn("input", rateErrors.soLuongPhong && "border-red-500")} {...registerRate('soLuongPhong', { valueAsNumber: true })} />
          </div>
          <div className="col-span-2 md:col-span-4 mt-2">
            <button type="submit" disabled={isRateSubmitting || bulkUpsertMutation.isPending} className="btn btn-primary w-full md:w-auto">
              {bulkUpsertMutation.isPending ? 'Đang áp dụng...' : 'Áp dụng đồng loạt cho khoảng ngày này'}
            </button>
          </div>
        </form>

        <h3 className="mb-3 text-[15px] font-bold text-heading">
          Lịch bán hiện tại: <span className="text-primary font-normal">{ratesRange.from} → {ratesRange.to}</span>
        </h3>
        {ratesQuery.isLoading ? (
          <div className="flex justify-center py-6" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span className="sr-only">Đang tải...</span></div>
        ) : ratesQuery.data && ratesQuery.data.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có dữ liệu giá cho khoảng ngày này.</p>
        ) : (
          <div className="overflow-auto border border-border rounded-xl max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-border text-[12px] uppercase font-bold text-muted">
                <tr>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Giá (VND)</th>
                  <th className="px-4 py-3">Số lượng mở bán</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ratesQuery.data?.map((rate) => (
                  <tr key={rate.MaQuyPhong} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-heading">{rate.NgayApDung.slice(0, 10)}</td>
                    <td className="px-4 py-3 text-primary font-semibold">{formatCurrencyVND(rate.GiaPhong)}</td>
                    <td className="px-4 py-3 font-medium text-heading">{rate.SoLuongPhong} phòng</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold ${rate.TrangThai === 'Mở bán' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {rate.TrangThai}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
