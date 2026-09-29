import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, Link } from 'react-router-dom';
import { useMyHotel, useUpdateHotel, useReplaceHotelAmenities, useUploadHotelImage, useDeleteHotelImage, useSetPrimaryHotelImage, useRoomTypes, useCreateRoomType, useDeactivateHotel } from '../features/owner/hooks';
import { useLocations } from '../features/locations/hooks';
import { useAmenities } from '../features/amenities/hooks';
import { hotelFormSchema, HotelFormSchemaValues, roomTypeFormSchema, RoomTypeFormSchemaValues } from '../features/owner/schemas';
import { ApiError } from '../services/apiClient';
import { fileToDataUrl, imageFileError, cn } from '../lib/utils';
import { useConfirm } from '../components/common/FeedbackProvider';
import { StatusBadge } from '../components/domain/StatusBadge';
import { Combobox } from '../components/common/Combobox';

export default function OwnerHotelManagePage() {
  const { id } = useParams<{ id: string }>();
  const hotelId = Number(id);
  const hotelQuery = useMyHotel(hotelId);
  const locationsQuery = useLocations();
  const amenitiesQuery = useAmenities();
  const updateMutation = useUpdateHotel(hotelId);
  const amenitiesMutation = useReplaceHotelAmenities(hotelId);
  const uploadImageMutation = useUploadHotelImage(hotelId);
  const deleteImageMutation = useDeleteHotelImage(hotelId);
  const setPrimaryMutation = useSetPrimaryHotelImage(hotelId);
  const roomTypesQuery = useRoomTypes(hotelId);
  const createRoomTypeMutation = useCreateRoomType(hotelId);
  const deactivateMutation = useDeactivateHotel(hotelId);
  const confirm = useConfirm();

  const [showRoomTypeForm, setShowRoomTypeForm] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<HotelFormSchemaValues>({ resolver: zodResolver(hotelFormSchema) });

  useEffect(() => {
    if (hotelQuery.data) {
      reset({
        TenKhachSan: hotelQuery.data.TenKhachSan,
        DiaChiChiTiet: hotelQuery.data.DiaChiChiTiet,
        HangSao: hotelQuery.data.HangSao,
        MoTa: hotelQuery.data.MoTa ?? '',
        GioNhanPhong: hotelQuery.data.GioNhanPhong.slice(11, 16),
        GioTraPhong: hotelQuery.data.GioTraPhong.slice(11, 16),
        MaDiaPhuong: hotelQuery.data.MaDiaPhuong,
      });
    }
  }, [hotelQuery.data, reset]);

  const {
    register: registerRoomType,
    handleSubmit: handleRoomTypeSubmit,
    reset: resetRoomTypeForm,
    formState: { errors: roomTypeErrors, isSubmitting: isRoomTypeSubmitting },
  } = useForm<RoomTypeFormSchemaValues>({ resolver: zodResolver(roomTypeFormSchema) });

  if (hotelQuery.isLoading) {
    return <div className="flex justify-center py-16" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span className="sr-only">Đang tải...</span></div>;
  }

  if (hotelQuery.isError || !hotelQuery.data) {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700 border border-red-200">
        {hotelQuery.error instanceof ApiError ? hotelQuery.error.message : 'Không tìm thấy khách sạn'}
      </div>
    );
  }

  const hotel = hotelQuery.data;
  const selectedAmenityIds = new Set((hotel.KHACH_SAN_TIEN_NGHI ?? []).map((k) => k.MaTienNghi));

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

  const onCreateRoomType = async (values: RoomTypeFormSchemaValues) => {
    await createRoomTypeMutation.mutateAsync(values);
    resetRoomTypeForm();
    setShowRoomTypeForm(false);
  };

  return (
    <div className="owner-hotel-manage flex flex-col gap-5 max-w-[1200px] mx-auto w-full">
      <Link to="/owner" className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại danh sách khách sạn</span>
      </Link>

      <header className="owner-entity-header">
        <div className="owner-entity-header__identity">
          <div><p className="owner-entity-header__eyebrow">Hồ sơ khách sạn</p><h1>{hotel.TenKhachSan}</h1><p>Cập nhật thông tin, quy định nhận phòng và hình ảnh cơ sở lưu trú.</p></div>
          <StatusBadge domain="hotel" status={hotel.TrangThai} />
        </div>
        <div className="owner-entity-header__actions">
          <button type="submit" form="owner-hotel-editor" disabled={!isDirty || updateMutation.isPending} className="btn btn-primary">
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          <details className="owner-action-menu" onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              event.currentTarget.open = false;
              event.currentTarget.querySelector('summary')?.focus();
            }
          }}>
            <summary aria-label="Thao tác khác với khách sạn">Thao tác khác <span aria-hidden="true">⌄</span></summary>
            <nav aria-label="Thao tác khách sạn">
              <Link to={`/owner/hotels/${hotelId}/analytics`}>Xem thống kê</Link>
              <Link to={`/owner/hotels/${hotelId}/bookings`}>Quản lý đặt phòng</Link>
              {hotel.TrangThai !== 'Ngừng hoạt động' && <button type="button" className="is-danger" disabled={deactivateMutation.isPending} onClick={async () => { if (await confirm({ title: 'Ngừng kinh doanh khách sạn?', description: 'Các đặt phòng lịch sử sẽ được giữ lại.', confirmLabel: 'Ngừng kinh doanh', variant: 'danger' })) deactivateMutation.mutate(); }}>{deactivateMutation.isPending ? 'Đang xử lý...' : 'Ngừng kinh doanh'}</button>}
            </nav>
          </details>
        </div>
      </header>

      {deactivateMutation.isSuccess && <div role="status" className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">Khách sạn đã ngừng kinh doanh; lịch sử booking được giữ lại.</div>}
      {deactivateMutation.isError && <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{deactivateMutation.error instanceof ApiError ? deactivateMutation.error.message : 'Không thể ngừng kinh doanh khách sạn'}</div>}

      <form id="owner-hotel-editor" onSubmit={handleSubmit((v) => updateMutation.mutate(v))} noValidate className="flex flex-col gap-5">
        {updateMutation.isError && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {updateMutation.error instanceof ApiError ? updateMutation.error.message : 'Cập nhật thất bại'}
          </div>
        )}

        <section className="owner-editor-section border-b border-border py-6 first:border-t">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-heading mb-1">Thông tin cơ bản</h2>
            <p className="text-sm text-muted">Tên thương mại, tiêu chuẩn sao và địa chỉ hiển thị với du khách</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label htmlFor="owner-hotel-manage-TenKhachSan" className="form-label">Tên cơ sở khách sạn / Resort <span className="text-red-500">*</span></label>
              <input id="owner-hotel-manage-TenKhachSan" type="text" className={cn("input", errors.TenKhachSan && "border-red-500")} {...register('TenKhachSan')} />
              {errors.TenKhachSan && <p className="text-xs text-red-500 mt-1">{errors.TenKhachSan.message}</p>}
            </div>

            <div>
              <label htmlFor="owner-hotel-manage-HangSao" className="form-label">Xếp hạng sao tiêu chuẩn <span className="text-red-500">*</span></label>
              <div className="relative">
                <select id="owner-hotel-manage-HangSao" className={cn("select", errors.HangSao && "border-red-500")} {...register('HangSao', { valueAsNumber: true })}>
                  <option value="">-- Chọn xếp hạng sao --</option>
                  {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s} Sao</option>)}
                </select>
                <i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
              </div>
            </div>

            <div>
              <Controller control={control} name="MaDiaPhuong" render={({ field }) => (
                <Combobox id="owner-hotel-manage-MaDiaPhuong" label="Tỉnh / Thành phố" placeholder="Tìm tỉnh hoặc thành phố..."
                  options={(locationsQuery.data ?? []).map((location) => ({ value: String(location.MaDiaPhuong), label: location.TenThanhPho }))}
                  value={field.value ? String(field.value) : ''} onValueChange={(value) => field.onChange(value ? Number(value) : undefined)} error={errors.MaDiaPhuong?.message} />
              )} />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="owner-hotel-manage-DiaChiChiTiet" className="form-label">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
              <input id="owner-hotel-manage-DiaChiChiTiet" type="text" className={cn("input", errors.DiaChiChiTiet && "border-red-500")} {...register('DiaChiChiTiet')} />
              {errors.DiaChiChiTiet && <p className="text-xs text-red-500 mt-1">{errors.DiaChiChiTiet.message}</p>}
            </div>
          </div>
        </section>

        <section className="owner-editor-section border-b border-border py-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-heading mb-1">Quy định vận hành & khung giờ</h2>
            <p className="text-sm text-muted">Thiết lập thời gian nhận và trả phòng tiêu chuẩn</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="owner-hotel-manage-GioNhanPhong" className="form-label">Giờ nhận phòng tiêu chuẩn (Check-in) <span className="text-red-500">*</span></label>
              <input id="owner-hotel-manage-GioNhanPhong" type="time" className={cn("input", errors.GioNhanPhong && "border-red-500")} {...register('GioNhanPhong')} />
              {errors.GioNhanPhong && <p className="text-xs text-red-500 mt-1">{errors.GioNhanPhong.message}</p>}
            </div>
            <div>
              <label htmlFor="owner-hotel-manage-GioTraPhong" className="form-label">Giờ trả phòng tiêu chuẩn (Check-out) <span className="text-red-500">*</span></label>
              <input id="owner-hotel-manage-GioTraPhong" type="time" className={cn("input", errors.GioTraPhong && "border-red-500")} {...register('GioTraPhong')} />
              {errors.GioTraPhong && <p className="text-xs text-red-500 mt-1">{errors.GioTraPhong.message}</p>}
            </div>
          </div>
        </section>

        <section className="owner-editor-section border-b border-border py-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-heading mb-1">Giới thiệu tổng quan</h2>
            <p className="text-sm text-muted">Đoạn văn ngắn làm nổi bật vị trí, phong cách kiến trúc và dịch vụ vượt trội</p>
          </div>
          <div>
            <textarea rows={4} className={cn("textarea", errors.MoTa && "border-red-500")} {...register('MoTa')} placeholder="Chia sẻ về phong cách thiết kế, vị trí..."></textarea>
          </div>
        </section>

        <section className="owner-editor-section border-b border-border py-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-heading mb-1">Tiện nghi & dịch vụ khách sạn</h2>
            <p className="text-sm text-muted">Tích chọn các dịch vụ tiện ích cơ sở hiện đang cung cấp</p>
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

        {isDirty && <p className="text-sm text-muted" role="status">Có thay đổi chưa được lưu.</p>}
        {updateMutation.isSuccess && (
          <div role="status" className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">Cập nhật thành công</div>
        )}
      </form>

      <section className="owner-editor-section border-t border-border py-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-bold text-heading mb-1">Hình ảnh cơ sở lưu trú</h2>
            <p className="text-sm text-muted">Ảnh đầu tiên sẽ làm ảnh bìa tìm kiếm</p>
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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {hotel.HINH_ANH_KHACH_SAN.map((img) => (
            <div key={img.MaHinhAnh} className="relative h-[120px] rounded-[10px] overflow-hidden border border-border bg-slate-100 group">
              <img src={img.URL} alt={`${hotel.TenKhachSan} - ảnh cơ sở lưu trú`} className="w-full h-full object-cover" />
              {img.AnhDaiDien && (
                <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[4px]">Ảnh đại diện</span>
              )}
              {!img.AnhDaiDien && (
                <button type="button" onClick={() => setPrimaryMutation.mutate(img.MaHinhAnh)} disabled={setPrimaryMutation.isPending} className="absolute bottom-1.5 left-1.5 bg-[#172033bf] text-white border-none text-[10px] px-1.5 py-1 rounded-[4px] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  Đặt làm bìa
                </button>
              )}
              <button type="button" aria-label={`Xóa ảnh ${img.URL}`} onClick={async () => { if (await confirm({ title: 'Xóa ảnh khách sạn?', description: 'Ảnh này sẽ bị xóa khỏi hồ sơ khách sạn.', confirmLabel: 'Xóa ảnh', variant: 'danger' })) deleteImageMutation.mutate(img.MaHinhAnh); }} disabled={deleteImageMutation.isPending} className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full bg-black/60 text-white border-none flex items-center justify-center text-[12px] cursor-pointer hover:bg-red-500">
                <i className="ph ph-x"></i>
              </button>
            </div>
          ))}
          <button type="button" aria-label="Thêm ảnh khách sạn" onClick={() => fileInputRef.current?.click()} className="h-[120px] w-full border-[1.5px] border-dashed border-primary bg-[#F5F9FF] rounded-[10px] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-[#EBF3FF] transition-colors">
            <i className="ph-fill ph-plus-circle text-primary text-[24px]"></i>
            <span className="text-[12px] font-bold text-primary">Thêm ảnh</span>
          </button>
        </div>
      </section>

      <section className="owner-editor-section border-t border-border py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-heading mb-1">Các loại phòng</h2>
            <p className="text-sm text-muted">Danh sách loại phòng của khách sạn</p>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowRoomTypeForm(v => !v)}>
            <i className="ph ph-plus"></i> Thêm loại phòng
          </button>
        </div>

        {showRoomTypeForm && (
          <form onSubmit={handleRoomTypeSubmit(onCreateRoomType)} className="bg-slate-50 border border-border rounded-lg p-5 mb-5 flex flex-col gap-4">
            <h3 className="font-bold text-heading text-[14px]">Thêm loại phòng mới</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="owner-hotel-manage-TenLoaiPhong" className="form-label text-[12px]">Tên loại phòng</label>
                <input id="owner-hotel-manage-TenLoaiPhong" type="text" className={cn("input", roomTypeErrors.TenLoaiPhong && "border-red-500")} {...registerRoomType('TenLoaiPhong')} />
              </div>
              <div>
                <label htmlFor="owner-hotel-manage-LoaiGiuong" className="form-label text-[12px]">Loại giường</label>
                <input id="owner-hotel-manage-LoaiGiuong" type="text" className={cn("input")} {...registerRoomType('LoaiGiuong')} />
              </div>
              <div>
                <label htmlFor="owner-hotel-manage-SoGiuong" className="form-label text-[12px]">Số giường</label>
                <input id="owner-hotel-manage-SoGiuong" type="number" min="1" className={cn("input")} {...registerRoomType('SoGiuong', { valueAsNumber: true })} />
              </div>
              <div>
                <label htmlFor="owner-hotel-manage-SucChua" className="form-label text-[12px]">Sức chứa (Khách)</label>
                <input id="owner-hotel-manage-SucChua" type="number" min="1" className={cn("input")} {...registerRoomType('SucChua', { valueAsNumber: true })} />
              </div>
              <div>
                <label htmlFor="owner-hotel-manage-DienTich" className="form-label text-[12px]">Diện tích (m²)</label>
                <input id="owner-hotel-manage-DienTich" type="number" min="1" step="0.1" className={cn("input")} {...registerRoomType('DienTich', { valueAsNumber: true })} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={isRoomTypeSubmitting || createRoomTypeMutation.isPending} className="btn btn-primary btn-sm">Tạo mới</button>
              <button type="button" onClick={() => setShowRoomTypeForm(false)} className="btn btn-secondary btn-sm">Hủy</button>
            </div>
          </form>
        )}

        <div className="flex flex-col gap-3">
          {roomTypesQuery.isLoading ? (
            <div className="flex justify-center py-6" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span className="sr-only">Đang tải...</span></div>
          ) : roomTypesQuery.data && roomTypesQuery.data.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có loại phòng nào.</p>
          ) : (
            roomTypesQuery.data?.map(rt => (
              <Link 
                key={rt.MaLoaiPhong} 
                to={`/owner/room-types/${rt.MaLoaiPhong}`}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-blue-300 transition-colors bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary text-xl"><i className="ph-duotone ph-bed"></i></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-heading text-[15px]">{rt.TenLoaiPhong}</span>
                      <StatusBadge domain="roomType" status={rt.TrangThai} />
                    </div>
                    <span className="text-[13px] text-muted">{rt.SucChua} khách · {rt.DienTich} m² · {rt.SoGiuong} giường ({rt.LoaiGiuong})</span>
                  </div>
                </div>
                <i className="ph ph-caret-right text-slate-400"></i>
              </Link>
            ))
          )}
        </div>
      </section>

    </div>
  );
}
