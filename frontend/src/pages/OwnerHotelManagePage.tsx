import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Trash2, ImagePlus, Plus, BedDouble, BarChart3 } from 'lucide-react';
import { Button } from '../components/common/Button';
import {
  useMyHotel,
  useUpdateHotel,
  useReplaceHotelAmenities,
  useUploadHotelImage,
  useDeleteHotelImage,
  useSetPrimaryHotelImage,
  useRoomTypes,
  useCreateRoomType,
} from '../features/owner/hooks';
import { useLocations } from '../features/locations/hooks';
import { useAmenities } from '../features/amenities/hooks';
import { hotelFormSchema, HotelFormSchemaValues, roomTypeFormSchema, RoomTypeFormSchemaValues } from '../features/owner/schemas';
import { ApiError } from '../services/apiClient';
import { fileToDataUrl, cn } from '../lib/utils';

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

  const [showRoomTypeForm, setShowRoomTypeForm] = useState(false);
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
    return (
      <div className="flex justify-center py-16" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    );
  }

  if (hotelQuery.isError || !hotelQuery.data) {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
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
    const dataUrl = await fileToDataUrl(file);
    await uploadImageMutation.mutateAsync(dataUrl);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onCreateRoomType = async (values: RoomTypeFormSchemaValues) => {
    await createRoomTypeMutation.mutateAsync(values);
    resetRoomTypeForm();
    setShowRoomTypeForm(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/owner">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay lại bảng điều khiển
        </Link>
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{hotel.TenKhachSan}</h1>
          <p className="text-sm text-slate-500">Trạng thái: {hotel.TrangThai}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/owner/hotels/${hotelId}/analytics`}>
              <BarChart3 className="mr-1.5 h-4 w-4" /> Xem thống kê
            </Link>
          </Button>
          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {hotel.HangSao} sao
          </span>
        </div>
      </div>

      {/* Info form */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-lg font-semibold text-slate-900">Thông tin khách sạn</h2>
        {updateMutation.isSuccess && (
          <div role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">Cập nhật thành công</div>
        )}
        {updateMutation.isError && (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {updateMutation.error instanceof ApiError ? updateMutation.error.message : 'Cập nhật thất bại'}
          </div>
        )}
        <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))} noValidate className="space-y-4">
          <div>
            <label htmlFor="TenKhachSan" className="block text-sm font-medium text-slate-700">Tên khách sạn</label>
            <input id="TenKhachSan" {...register('TenKhachSan')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            {errors.TenKhachSan && <p className="mt-1 text-xs text-red-600">{errors.TenKhachSan.message}</p>}
          </div>
          <div>
            <label htmlFor="DiaChiChiTiet" className="block text-sm font-medium text-slate-700">Địa chỉ chi tiết</label>
            <input id="DiaChiChiTiet" {...register('DiaChiChiTiet')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="MaDiaPhuong" className="block text-sm font-medium text-slate-700">Địa phương</label>
              <select id="MaDiaPhuong" {...register('MaDiaPhuong')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {locationsQuery.data?.map((loc) => (
                  <option key={loc.MaDiaPhuong} value={loc.MaDiaPhuong}>{loc.TenThanhPho}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="HangSao" className="block text-sm font-medium text-slate-700">Hạng sao</label>
              <select id="HangSao" {...register('HangSao')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{s} sao</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="GioNhanPhong" className="block text-sm font-medium text-slate-700">Giờ nhận phòng</label>
              <input id="GioNhanPhong" type="time" {...register('GioNhanPhong')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="GioTraPhong" className="block text-sm font-medium text-slate-700">Giờ trả phòng</label>
              <input id="GioTraPhong" type="time" {...register('GioTraPhong')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="MoTa" className="block text-sm font-medium text-slate-700">Mô tả</label>
            <textarea id="MoTa" rows={4} {...register('MoTa')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
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
        {hotel.HINH_ANH_KHACH_SAN.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có hình ảnh nào.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {hotel.HINH_ANH_KHACH_SAN.map((img) => (
              <div key={img.MaHinhAnh} className="group relative overflow-hidden rounded-lg border border-slate-200">
                <img src={img.URL} alt="" className="h-28 w-full object-cover" />
                {img.AnhDaiDien && (
                  <span className="absolute left-1 top-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">Đại diện</span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 px-1.5 py-1 opacity-0 transition group-hover:opacity-100">
                  {!img.AnhDaiDien && (
                    <button type="button" onClick={() => setPrimaryMutation.mutate(img.MaHinhAnh)} className="text-[10px] text-white hover:underline">
                      Đặt đại diện
                    </button>
                  )}
                  <button type="button" onClick={() => deleteImageMutation.mutate(img.MaHinhAnh)} className="ml-auto text-white hover:text-red-300">
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

      {/* Room types */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Loại phòng</h2>
          <Button size="sm" variant="outline" onClick={() => setShowRoomTypeForm((v) => !v)}>
            <Plus className="mr-1 h-4 w-4" /> Thêm loại phòng
          </Button>
        </div>

        {showRoomTypeForm && (
          <form onSubmit={handleRoomTypeSubmit(onCreateRoomType)} noValidate className="space-y-3 rounded-lg bg-slate-50 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="TenLoaiPhong" className="block text-xs font-medium text-slate-600">Tên loại phòng</label>
                <input id="TenLoaiPhong" {...registerRoomType('TenLoaiPhong')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                {roomTypeErrors.TenLoaiPhong && <p className="mt-1 text-xs text-red-600">{roomTypeErrors.TenLoaiPhong.message}</p>}
              </div>
              <div>
                <label htmlFor="LoaiGiuong" className="block text-xs font-medium text-slate-600">Loại giường</label>
                <input id="LoaiGiuong" {...registerRoomType('LoaiGiuong')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="SoGiuong" className="block text-xs font-medium text-slate-600">Số giường</label>
                <input id="SoGiuong" type="number" min={1} {...registerRoomType('SoGiuong')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="SucChua" className="block text-xs font-medium text-slate-600">Sức chứa</label>
                <input id="SucChua" type="number" min={1} {...registerRoomType('SucChua')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="DienTich" className="block text-xs font-medium text-slate-600">Diện tích (m²)</label>
                <input id="DienTich" type="number" min={1} step="0.1" {...registerRoomType('DienTich')} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <Button type="submit" size="sm" disabled={isRoomTypeSubmitting || createRoomTypeMutation.isPending}>
              {createRoomTypeMutation.isPending ? 'Đang tạo...' : 'Tạo loại phòng'}
            </Button>
          </form>
        )}

        {roomTypesQuery.isLoading ? (
          <div className="flex justify-center py-6" role="status" aria-live="polite">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          </div>
        ) : roomTypesQuery.data && roomTypesQuery.data.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có loại phòng nào.</p>
        ) : (
          <div className="space-y-2">
            {roomTypesQuery.data?.map((rt) => (
              <Link
                key={rt.MaLoaiPhong}
                to={`/owner/room-types/${rt.MaLoaiPhong}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:border-slate-300"
              >
                <div className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-900">{rt.TenLoaiPhong}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      rt.TrangThai === 'Hoạt động' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {rt.TrangThai}
                  </span>
                </div>
                <span className="text-xs text-slate-500">{rt.SucChua} khách · {rt.DienTich} m²</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
