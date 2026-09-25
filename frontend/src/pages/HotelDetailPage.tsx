import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { MapPin, Star, ArrowLeft, CheckCircle2, BedDouble, Users, Ruler } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useHotelDetail, useHotelRooms } from '../features/hotels/hooks';
import { defaultSearchDates } from '../features/hotels/schemas';
import { ApiError } from '../services/apiClient';
import { formatCurrencyVND, cn } from '../lib/utils';

const dateGuestSchema = z
  .object({
    checkIn: z.string().min(1),
    checkOut: z.string().min(1),
    guests: z.coerce.number().int().min(1).max(50),
  })
  .refine((d) => d.checkOut > d.checkIn, { message: 'Ngày trả phòng phải sau ngày nhận phòng', path: ['checkOut'] });
type DateGuestValues = z.infer<typeof dateGuestSchema>;

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const hotelId = Number(id);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const defaults = defaultSearchDates();
  const checkIn = searchParams.get('checkIn') || defaults.checkIn;
  const checkOut = searchParams.get('checkOut') || defaults.checkOut;
  const guests = Number(searchParams.get('guests')) || 1;

  const hotelQuery = useHotelDetail(hotelId);
  const roomsQuery = useHotelRooms(hotelId, { checkIn, checkOut, guests });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DateGuestValues>({
    resolver: zodResolver(dateGuestSchema),
    values: { checkIn, checkOut, guests },
  });

  const onDatesSubmit = (values: DateGuestValues) => {
    setSelectedRoomId(null);
    setSearchParams({ checkIn: values.checkIn, checkOut: values.checkOut, guests: String(values.guests) });
  };

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
  const selectedRoom = roomsQuery.data?.find((r) => r.MaLoaiPhong === selectedRoomId);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/hotels">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay lại danh sách
          </Link>
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{hotel.TenKhachSan}</h1>
            <p className="mt-1 flex items-center text-sm text-slate-500">
              <MapPin className="mr-1 h-4 w-4 text-slate-400" /> {hotel.DiaChiChiTiet}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="font-bold">{hotel.HangSao} sao</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {hotel.HinhAnh.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              <img
                src={hotel.HinhAnh[0].URL}
                alt={hotel.TenKhachSan}
                className="col-span-4 h-72 w-full rounded-2xl object-cover sm:col-span-3"
              />
              <div className="col-span-4 grid grid-cols-4 gap-2 sm:col-span-1 sm:grid-cols-1">
                {hotel.HinhAnh.slice(1, 4).map((img) => (
                  <img key={img.MaHinhAnh} src={img.URL} alt="" className="h-16 w-full rounded-lg object-cover sm:h-[5.5rem]" />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-200 text-slate-400">
              Chưa có hình ảnh
            </div>
          )}

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-xl font-semibold text-slate-900">Giới thiệu khách sạn</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              {hotel.MoTa ?? 'Khách sạn chưa cập nhật mô tả chi tiết.'}
            </p>
            {hotel.TienNghi.length > 0 && (
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                {hotel.TienNghi.map((a) => (
                  <div key={a.MaTienNghi} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {a.TenTienNghi}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Room selection */}
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-xl font-semibold text-slate-900">Chọn loại phòng</h2>

            <form onSubmit={handleSubmit(onDatesSubmit)} noValidate className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <label htmlFor="detail-checkIn" className="mb-1 block text-xs font-medium text-slate-600">
                  Nhận phòng
                </label>
                <input
                  id="detail-checkIn"
                  type="date"
                  {...register('checkIn')}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="detail-checkOut" className="mb-1 block text-xs font-medium text-slate-600">
                  Trả phòng
                </label>
                <input
                  id="detail-checkOut"
                  type="date"
                  {...register('checkOut')}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                {errors.checkOut && <p className="mt-1 text-xs text-red-600">{errors.checkOut.message}</p>}
              </div>
              <div>
                <label htmlFor="detail-guests" className="mb-1 block text-xs font-medium text-slate-600">
                  Số khách
                </label>
                <input
                  id="detail-guests"
                  type="number"
                  min={1}
                  max={50}
                  {...register('guests')}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <Button type="submit" className="self-end">
                Cập nhật
              </Button>
            </form>

            {roomsQuery.isLoading ? (
              <div className="flex justify-center py-10" role="status" aria-live="polite">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
              </div>
            ) : roomsQuery.isError ? (
              <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {roomsQuery.error instanceof ApiError ? roomsQuery.error.message : 'Không thể tải danh sách phòng'}
              </div>
            ) : roomsQuery.data && roomsQuery.data.length === 0 ? (
              <div className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Không có loại phòng phù hợp với số khách đã chọn.
              </div>
            ) : (
              <div className="space-y-3">
                {roomsQuery.data?.map((room) => (
                  <button
                    key={room.MaLoaiPhong}
                    type="button"
                    disabled={!room.ConHang}
                    onClick={() => setSelectedRoomId(room.MaLoaiPhong)}
                    className={cn(
                      'w-full rounded-xl border p-4 text-left transition',
                      !room.ConHang && 'cursor-not-allowed opacity-50',
                      selectedRoomId === room.MaLoaiPhong
                        ? 'border-blue-600 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1.5">
                        <h3 className="font-semibold text-slate-900">{room.TenLoaiPhong}</h3>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {room.SucChua} khách
                          </span>
                          <span className="flex items-center gap-1">
                            <BedDouble className="h-3.5 w-3.5" /> {room.LoaiGiuong}
                          </span>
                          <span className="flex items-center gap-1">
                            <Ruler className="h-3.5 w-3.5" /> {room.DienTich} m²
                          </span>
                        </div>
                        {!room.ConHang && (
                          <span className="inline-block rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                            Hết phòng cho khoảng ngày đã chọn
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {room.GiaTheoDem !== null ? (
                          <>
                            <p className="text-lg font-bold text-blue-600">
                              {formatCurrencyVND(room.GiaTheoDem)}
                              <span className="text-xs font-normal text-slate-500"> /đêm</span>
                            </p>
                            {room.TongTien !== null && room.SoDem > 1 && (
                              <p className="text-xs text-slate-500">
                                {formatCurrencyVND(room.TongTien)} cho {room.SoDem} đêm
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-slate-400">Không có giá</p>
                        )}
                        {room.ConHang && (
                          <p className="text-xs text-slate-500">Còn {room.SoPhongConLai} phòng</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Đặt phòng ngay</h2>
            {selectedRoom ? (
              <div className="space-y-2 rounded-lg bg-blue-50 p-3 text-sm">
                <p className="font-semibold text-slate-900">{selectedRoom.TenLoaiPhong}</p>
                <p className="text-slate-600">
                  {checkIn} → {checkOut} ({selectedRoom.SoDem} đêm)
                </p>
                {selectedRoom.TongTien !== null && (
                  <p className="text-base font-bold text-blue-700">{formatCurrencyVND(selectedRoom.TongTien)}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Chọn một loại phòng bên trái để xem tóm tắt.</p>
            )}
            <p className="text-xs text-slate-500">Chức năng đặt phòng sẽ được mở trong phase tiếp theo (M3).</p>
            <Button className="w-full" disabled>
              Tiếp tục đặt phòng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
