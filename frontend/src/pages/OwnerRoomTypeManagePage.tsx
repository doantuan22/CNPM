import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  useRoomType,
  useUpdateRoomType,
  useDeactivateRoomType,
  useReplaceRoomTypeAmenities,
  useUploadRoomTypeImage,
  useDeleteRoomTypeImage,
  useSetPrimaryRoomTypeImage,
} from '../features/owner/hooks';
import { useAmenities } from '../features/amenities/hooks';
import {
  roomTypeFormSchema,
  RoomTypeFormSchemaValues,
} from '../features/owner/schemas';
import { ApiError } from '../services/apiClient';
import { fileToDataUrl, imageFileError, cn } from '../lib/utils';
import { useConfirm } from '../components/common/FeedbackProvider';
import { StatusBadge } from '../components/domain/StatusBadge';

export default function OwnerRoomTypeManagePage() {
  const { roomTypeId: roomTypeParam } = useParams<{ roomTypeId: string }>();
  const roomTypeId = Number(roomTypeParam);
  const roomTypeQuery = useRoomType(roomTypeId);
  const [routeParams, setRouteParams] = useSearchParams();
  const amenitiesQuery = useAmenities();
  const updateMutation = useUpdateRoomType(roomTypeId);
  const deactivateMutation = useDeactivateRoomType(roomTypeId);
  const amenitiesMutation = useReplaceRoomTypeAmenities(roomTypeId);
  const uploadImageMutation = useUploadRoomTypeImage(roomTypeId);
  const deleteImageMutation = useDeleteRoomTypeImage(roomTypeId);
  const setPrimaryMutation = useSetPrimaryRoomTypeImage(roomTypeId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const confirm = useConfirm();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RoomTypeFormSchemaValues>({ resolver: zodResolver(roomTypeFormSchema) });

  useEffect(() => {
    if (!roomTypeQuery.data) return;
    reset({
        TenLoaiPhong: roomTypeQuery.data.TenLoaiPhong,
        SoGiuong: roomTypeQuery.data.SoGiuong,
        SucChua: roomTypeQuery.data.SucChua,
        DienTich: roomTypeQuery.data.DienTich,
        LoaiGiuong: roomTypeQuery.data.LoaiGiuong,
        MoTa: roomTypeQuery.data.MoTa ?? '',
    });
  }, [roomTypeQuery.data, reset]);

  useEffect(() => {
    if (roomTypeQuery.data && routeParams.get('hotelId') !== String(roomTypeQuery.data.MaKhachSan)) {
      const next = new URLSearchParams(routeParams);
      next.set('hotelId', String(roomTypeQuery.data.MaKhachSan));
      setRouteParams(next, { replace: true });
    }
  }, [roomTypeQuery.data, routeParams, setRouteParams]);

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

  return (
    <div className="flex flex-col gap-5 max-w-[1040px] mx-auto w-full">
      <Link to={`/owner/room-types?hotelId=${roomType.MaKhachSan}`} className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại loại phòng · {roomType.KHACH_SAN?.TenKhachSan ?? 'khách sạn'}</span>
      </Link>

      <div className="flex justify-between items-center flex-wrap gap-3 bg-white border border-border rounded-[14px] px-6 py-4">
        <div>
          <h1 className="text-[20px] font-bold text-heading mb-0.5">Chỉnh sửa: {roomType.TenLoaiPhong}</h1>
          <p className="text-[13px] text-muted">Cập nhật thông số kỹ thuật, sức chứa, tiện ích và thư viện ảnh của loại phòng này.</p>
        </div>
        <StatusBadge domain="roomType" status={roomType.TrangThai} />
      </div>

      <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))} noValidate className="flex flex-col gap-5">
        {updateMutation.isError && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {updateMutation.error instanceof ApiError ? updateMutation.error.message : 'Cập nhật thất bại'}
          </div>
        )}

        <section className="owner-editor-section border-b border-border py-6 first:border-t">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-heading mb-1">Thông số kỹ thuật & cấu hình</h2>
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

        <section className="owner-editor-section border-b border-border py-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-heading mb-1">Giới thiệu & mô tả không gian</h2>
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
                onClick={async () => { if (await confirm({ title: 'Ngừng bán loại phòng?', description: 'Các đặt phòng lịch sử sẽ được giữ lại.', confirmLabel: 'Ngừng bán', variant: 'danger' })) deactivateMutation.mutate(); }}
              >
                {deactivateMutation.isPending ? 'Đang xử lý...' : 'Ngừng bán'}
              </button>
            )}
          </div>
        </div>
      </form>

      <section className="owner-editor-section border-b border-border py-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-heading mb-1">Tiện nghi phòng sẵn có</h2>
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

      <section className="owner-editor-section border-b border-border py-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-bold text-heading mb-1">Thư viện hình ảnh loại phòng</h2>
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
              <img src={img.URL} alt={`${roomType.TenLoaiPhong} - ảnh phòng`} className="w-full h-full object-cover" />
              {img.LaAnhDaiDien && (
                <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[4px]">Ảnh đại diện</span>
              )}
              {!img.LaAnhDaiDien && (
                <button type="button" onClick={() => setPrimaryMutation.mutate(img.MaHinhAnhLoaiPhong)} disabled={setPrimaryMutation.isPending} className="absolute bottom-1.5 left-1.5 bg-[#172033bf] text-white border-none text-[10px] px-1.5 py-1 rounded-[4px] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  Đặt làm bìa
                </button>
              )}
              <button type="button" aria-label={`Xóa ảnh ${img.URL}`} onClick={async () => { if (await confirm({ title: 'Xóa ảnh loại phòng?', description: 'Ảnh này sẽ bị xóa khỏi loại phòng.', confirmLabel: 'Xóa ảnh', variant: 'danger' })) deleteImageMutation.mutate(img.MaHinhAnhLoaiPhong); }} disabled={deleteImageMutation.isPending} className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full bg-black/60 text-white border-none flex items-center justify-center text-[12px] cursor-pointer hover:bg-red-500">
                <i className="ph ph-x"></i>
              </button>
            </div>
          ))}
          <button type="button" aria-label="Thêm ảnh loại phòng" onClick={() => fileInputRef.current?.click()} className="h-[110px] w-full border-[1.5px] border-dashed border-primary bg-[#F5F9FF] rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#EBF3FF] transition-colors">
            <i className="ph-fill ph-plus-circle text-primary text-[20px]"></i>
            <span className="text-[12px] font-bold text-primary">Thêm ảnh</span>
          </button>
        </div>
      </section>

      <section className="owner-editor-section border-t border-border py-6"><h2 className="text-lg font-bold text-heading mb-1">Giá &amp; quỹ phòng</h2><p className="text-sm text-muted">Bảng giá được quản lý tập trung trong workspace Quỹ phòng &amp; giá bán.</p><Link className="btn btn-secondary mt-3" to={`/owner/inventory-pricing?hotelId=${roomType.MaKhachSan}&roomTypeId=${roomType.MaLoaiPhong}`}>Mở Quỹ phòng &amp; giá bán</Link></section>
    </div>
  );
}
