import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, Link } from 'react-router-dom';
import { useMyHotel, useUpdateHotel, useReplaceHotelAmenities, useUploadHotelImage, useDeleteHotelImage, useSetPrimaryHotelImage, useRoomTypes, useCreateRoomType, useDeactivateHotel } from '../features/owner/hooks';
import { useLocations } from '../features/locations/hooks';
import { useAmenities } from '../features/amenities/hooks';
import { hotelFormSchema, HotelFormSchemaValues, roomTypeFormSchema, RoomTypeFormSchemaValues } from '../features/owner/schemas';
import { ApiError } from '../services/apiClient';
import { fileToDataUrl, imageFileError, cn } from '../lib/utils';

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'Hoạt động':
      return 'status-active';
    case 'Chờ duyệt':
      return 'status-pending';
    case 'Đình chỉ':
      return 'status-suspended';
    default:
      return 'status-pending';
  }
}

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

  const [showRoomTypeForm, setShowRoomTypeForm] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
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
    return <div className="flex justify-center py-16"><div className="spinner"></div></div>;
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
    <div className="flex flex-col gap-5 max-w-[1080px] mx-auto w-full">
      <Link to="/owner" className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại danh sách khách sạn</span>
      </Link>

      <div className="flex justify-between items-center flex-wrap gap-3 bg-white border border-border rounded-[14px] px-6 py-4">
        <div>
          <h1 className="text-[20px] font-bold text-heading mb-0.5">Hồ sơ khách sạn</h1>
          <p className="text-[13px] text-muted">Cập nhật thông tin chi tiết, quy định nhận phòng và hình ảnh cơ sở lưu trú.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-border px-3.5 py-2 rounded-lg cursor-pointer hover:bg-white hover:border-primary transition-all">
            <div>
              <span className="text-[12px] text-muted font-medium block leading-tight">Đang quản lý:</span>
              <div className="text-[13px] font-bold text-heading leading-tight flex items-center gap-1.5"><i className="ph-fill ph-buildings text-primary"></i> {hotel.TenKhachSan}</div>
            </div>
          </div>
          <div className={`status-badge ${getStatusBadgeClass(hotel.TrangThai)}`}>{hotel.TrangThai}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Link to={`/owner/hotels/${hotelId}/analytics`} className="btn btn-outline btn-sm">
          <i className="ph ph-chart-bar"></i> Xem thống kê
        </Link>
        <Link to={`/owner/hotels/${hotelId}/bookings`} className="btn btn-outline btn-sm">
          <i className="ph ph-calendar"></i> Quản lý Booking
        </Link>
        {hotel.TrangThai !== 'Ngừng hoạt động' && (
          <button 
            type="button" 
            className="btn btn-danger-outline btn-sm"
            disabled={deactivateMutation.isPending}
            onClick={() => { if (window.confirm('Ngừng kinh doanh khách sạn? Booking lịch sử sẽ được giữ lại.')) deactivateMutation.mutate(); }}
          >
            {deactivateMutation.isPending ? 'Đang xử lý...' : 'Ngừng kinh doanh'}
          </button>
        )}
      </div>

      {deactivateMutation.isSuccess && <div role="status" className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">Khách sạn đã ngừng kinh doanh; lịch sử booking được giữ lại.</div>}
      {deactivateMutation.isError && <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{deactivateMutation.error instanceof ApiError ? deactivateMutation.error.message : 'Không thể ngừng kinh doanh khách sạn'}</div>}

      <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))} noValidate className="flex flex-col gap-5">
        {updateMutation.isError && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {updateMutation.error instanceof ApiError ? updateMutation.error.message : 'Cập nhật thất bại'}
          </div>
        )}

        <section className="bg-white border border-border rounded-[16px] p-7 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-heading flex items-center gap-2 mb-1">🏢 Thông tin cơ bản</h2>
            <p className="text-sm text-muted">Tên thương mại, tiêu chuẩn sao và địa chỉ hiển thị với du khách</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="form-label">Tên cơ sở khách sạn / Resort <span className="text-red-500">*</span></label>
              <input type="text" className={cn("input", errors.TenKhachSan && "border-red-500")} {...register('TenKhachSan')} />
              {errors.TenKhachSan && <p className="text-xs text-red-500 mt-1">{errors.TenKhachSan.message}</p>}
            </div>

            <div>
              <label className="form-label">Xếp hạng sao tiêu chuẩn <span className="text-red-500">*</span></label>
              <div className="relative">
                <select className={cn("select", errors.HangSao && "border-red-500")} {...register('HangSao', { valueAsNumber: true })}>
                  <option value="">-- Chọn xếp hạng sao --</option>
                  {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s} Sao</option>)}
                </select>
                <i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
              </div>
            </div>

            <div>
              <label className="form-label">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
              <div className="relative">
                <select className={cn("select", errors.MaDiaPhuong && "border-red-500")} {...register('MaDiaPhuong', { valueAsNumber: true })}>
                  <option value="">-- Chọn tỉnh thành --</option>
                  {locationsQuery.data?.map(loc => (
                    <option key={loc.MaDiaPhuong} value={loc.MaDiaPhuong}>{loc.TenThanhPho}</option>
                  ))}
                </select>
                <i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
              <input type="text" className={cn("input", errors.DiaChiChiTiet && "border-red-500")} {...register('DiaChiChiTiet')} />
              {errors.DiaChiChiTiet && <p className="text-xs text-red-500 mt-1">{errors.DiaChiChiTiet.message}</p>}
            </div>
          </div>
        </section>

        <section className="bg-white border border-border rounded-[16px] p-7 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-heading flex items-center gap-2 mb-1">⏱️ Quy định vận hành & Khung giờ</h2>
            <p className="text-sm text-muted">Thiết lập thời gian nhận và trả phòng tiêu chuẩn</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="form-label">Giờ nhận phòng tiêu chuẩn (Check-in) <span className="text-red-500">*</span></label>
              <input type="time" className={cn("input", errors.GioNhanPhong && "border-red-500")} {...register('GioNhanPhong')} />
              {errors.GioNhanPhong && <p className="text-xs text-red-500 mt-1">{errors.GioNhanPhong.message}</p>}
            </div>
            <div>
              <label className="form-label">Giờ trả phòng tiêu chuẩn (Check-out) <span className="text-red-500">*</span></label>
              <input type="time" className={cn("input", errors.GioTraPhong && "border-red-500")} {...register('GioTraPhong')} />
              {errors.GioTraPhong && <p className="text-xs text-red-500 mt-1">{errors.GioTraPhong.message}</p>}
            </div>
          </div>
        </section>

        <section className="bg-white border border-border rounded-[16px] p-7 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-heading flex items-center gap-2 mb-1">📝 Giới thiệu tổng quan</h2>
            <p className="text-sm text-muted">Đoạn văn ngắn làm nổi bật vị trí, phong cách kiến trúc và dịch vụ vượt trội</p>
          </div>
          <div>
            <textarea rows={4} className={cn("textarea", errors.MoTa && "border-red-500")} {...register('MoTa')} placeholder="Chia sẻ về phong cách thiết kế, vị trí..."></textarea>
          </div>
        </section>

        <section className="bg-white border border-border rounded-[16px] p-7 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-heading flex items-center gap-2 mb-1">✨ Tiện nghi & Dịch vụ khách sạn</h2>
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

        <div className="flex justify-between items-center flex-wrap gap-3 bg-white border border-border rounded-[14px] px-6 py-4 shadow-sm">
          <span className="text-[13px] text-muted flex items-center gap-1.5">
            <i className="ph ph-clock"></i> Hãy nhớ bấm lưu sau khi thay đổi
          </span>
          <div className="flex gap-3">
            <button type="submit" disabled={!isDirty || updateMutation.isPending} className="btn btn-primary">
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}
            </button>
          </div>
        </div>
        {updateMutation.isSuccess && (
          <div role="status" className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">Cập nhật thành công</div>
        )}
      </form>

      <section className="bg-white border border-border rounded-[16px] p-7 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-bold text-heading flex items-center gap-2 mb-1">📸 Hình ảnh cơ sở lưu trú</h2>
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
              <img src={img.URL} alt="Hotel img" className="w-full h-full object-cover" />
              {img.AnhDaiDien && (
                <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[4px]">Ảnh đại diện</span>
              )}
              {!img.AnhDaiDien && (
                <button type="button" onClick={() => setPrimaryMutation.mutate(img.MaHinhAnh)} disabled={setPrimaryMutation.isPending} className="absolute bottom-1.5 left-1.5 bg-[#172033bf] text-white border-none text-[10px] px-1.5 py-1 rounded-[4px] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  Đặt làm bìa
                </button>
              )}
              <button type="button" onClick={() => { if (window.confirm('Xóa ảnh này?')) deleteImageMutation.mutate(img.MaHinhAnh); }} disabled={deleteImageMutation.isPending} className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full bg-black/60 text-white border-none flex items-center justify-center text-[12px] cursor-pointer hover:bg-red-500">
                <i className="ph ph-x"></i>
              </button>
            </div>
          ))}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="h-[120px] border-[1.5px] border-dashed border-primary bg-[#F5F9FF] rounded-[10px] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-[#EBF3FF] transition-colors"
          >
            <i className="ph-fill ph-plus-circle text-primary text-[24px]"></i>
            <span className="text-[12px] font-bold text-primary">Thêm ảnh</span>
          </div>
        </div>
      </section>

      <section className="bg-white border border-border rounded-[16px] p-7 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-heading flex items-center gap-2 mb-1">🛏️ Các loại phòng</h2>
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
                <label className="form-label text-[12px]">Tên loại phòng</label>
                <input type="text" className={cn("input", roomTypeErrors.TenLoaiPhong && "border-red-500")} {...registerRoomType('TenLoaiPhong')} />
              </div>
              <div>
                <label className="form-label text-[12px]">Loại giường</label>
                <input type="text" className={cn("input")} {...registerRoomType('LoaiGiuong')} />
              </div>
              <div>
                <label className="form-label text-[12px]">Số giường</label>
                <input type="number" min="1" className={cn("input")} {...registerRoomType('SoGiuong', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="form-label text-[12px]">Sức chứa (Khách)</label>
                <input type="number" min="1" className={cn("input")} {...registerRoomType('SucChua', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="form-label text-[12px]">Diện tích (m²)</label>
                <input type="number" min="1" step="0.1" className={cn("input")} {...registerRoomType('DienTich', { valueAsNumber: true })} />
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
            <div className="flex justify-center py-6"><div className="spinner"></div></div>
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
                      <span className={`status-badge ${rt.TrangThai === 'Hoạt động' ? 'status-active' : 'status-suspended'}`}>{rt.TrangThai}</span>
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
