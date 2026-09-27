import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useHotelDetail, useHotelRooms } from '../features/hotels/hooks';
import { defaultSearchDates } from '../features/hotels/schemas';
import { useCreateQuote } from '../features/quotes/hooks';
import { useCreateBooking } from '../features/bookings/hooks';
import { useAuthStore } from '../lib/authStore';
import { ROLE_NAMES } from '../lib/roles';
import { ApiError } from '../services/apiClient';
import { formatCurrencyVND, cn } from '../lib/utils';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const quoteMutation = useCreateQuote(hotelId);
  const bookingMutation = useCreateBooking(hotelId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);

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
    quoteMutation.reset();
    setSearchParams({ checkIn: values.checkIn, checkOut: values.checkOut, guests: String(values.guests) });
  };

  const selectRoom = (maLoaiPhong: number) => {
    setSelectedRoomId(maLoaiPhong);
    setSelectedQuantity(1);
    setPromoCode('');
    setGhiChu('');
    quoteMutation.reset();
    bookingMutation.reset();
  };

  const requestQuote = (withPromo: boolean) => {
    if (!selectedRoomId) return;
    bookingMutation.reset();
    quoteMutation.mutate({
      checkIn,
      checkOut,
      rooms: [{ maLoaiPhong: selectedRoomId, soLuong: selectedQuantity }],
      promoCode: withPromo && promoCode.trim() ? promoCode.trim() : undefined,
    });
  };

  // Re-quote automatically once a room is selected (and whenever quantity changes).
  useEffect(() => {
    if (selectedRoomId) requestQuote(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomId, selectedQuantity]);

  const confirmBooking = () => {
    if (!selectedRoomId || !quoteMutation.data) return;
    bookingMutation.mutate(
      {
        checkIn,
        checkOut,
        rooms: [{ maLoaiPhong: selectedRoomId, soLuong: selectedQuantity }],
        promoCode: quoteMutation.data.PromoHopLe && promoCode.trim() ? promoCode.trim() : undefined,
        ghiChu: ghiChu.trim() || undefined,
      },
      {
        onSuccess: (booking) => {
          navigate(`/bookings/${booking.MaDatPhong}`, { state: { justBooked: true } });
        },
      }
    );
  };

  if (hotelQuery.isLoading) {
    return <div className="flex justify-center py-16"><div className="spinner"></div></div>;
  }

  if (hotelQuery.isError || !hotelQuery.data) {
    return (
      <div role="alert" className="mx-auto max-w-md mt-8 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
        {hotelQuery.error instanceof ApiError ? hotelQuery.error.message : 'Không tìm thấy khách sạn'}
      </div>
    );
  }

  const hotel = hotelQuery.data;
  const selectedRoom = roomsQuery.data?.find((r) => r.MaLoaiPhong === selectedRoomId);

  return (
    <div className="booking-flow bg-surface text-ink min-h-screen pb-12 w-full !max-w-full !px-0 !py-0">
      
      {/* BREADCRUMB & TOP ACTIONS */}
      <section className="bg-surface-secondary border-b border-border/80">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav className="flex items-center gap-2 text-ink-muted overflow-x-auto py-1">
            <Link to="/" className="hover:text-primary font-medium transition-colors">Trang chủ</Link>
            <i className="ph ph-caret-right text-sm text-gray-400"></i>
            <Link to="/hotels" className="hover:text-primary font-medium transition-colors">Khách sạn</Link>
            <i className="ph ph-caret-right text-sm text-gray-400"></i>
            <span className="font-semibold text-ink truncate max-w-[200px] sm:max-w-none">{hotel.TenKhachSan}</span>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/hotels" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border hover:border-blue-400 text-ink font-medium transition-all shadow-sm hover:text-primary">
              <i className="ph ph-arrow-left text-sm"></i>
              <span>Quay lại kết quả tìm kiếm</span>
            </Link>
          </div>
        </div>
      </section>

      {/* HOTEL TITLE HEADER */}
      <section className="pt-6 pb-4 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex items-center text-warning gap-0.5">
                  {Array(5).fill(0).map((_, i) => (
                    <i key={i} className={cn("ph-fill ph-star text-base", i >= hotel.HangSao && "text-slate-300 ph")}></i>
                  ))}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-primary border border-blue-200">
                  {hotel.HangSao} Sao
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight">
                {hotel.TenKhachSan}
              </h1>
              <div className="flex items-center flex-wrap gap-2 text-sm text-ink-muted mt-2">
                <i className="ph ph-map-pin text-base text-primary flex-shrink-0"></i>
                <span>{hotel.DiaChiChiTiet}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 self-start lg:self-end">
              <div className="flex items-center gap-2">
                <button className="h-11 px-3.5 rounded-xl border border-border hover:border-blue-400 hover:bg-surface-secondary text-ink text-xs font-semibold flex items-center gap-2 transition-all shadow-sm">
                  <i className="ph ph-share-network text-base text-ink-muted"></i>
                  <span className="hidden sm:inline">Chia sẻ</span>
                </button>
                <button className="h-11 px-3.5 rounded-xl border border-border hover:border-rose-300 hover:bg-rose-50 text-ink text-xs font-semibold flex items-center gap-2 transition-all shadow-sm">
                  <i className="ph ph-heart text-base text-ink-muted transition-colors"></i>
                  <span className="hidden sm:inline">Lưu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY GRID SECTION */}
      <section className="py-4 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          {hotel.HinhAnh.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-2xl overflow-hidden relative shadow-md">
              <div className="md:col-span-2 relative group overflow-hidden cursor-pointer h-[320px] md:h-[440px]">
                <img 
                  src={hotel.HinhAnh[0].URL} 
                  alt={hotel.TenKhachSan} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-3 h-[320px] md:h-[440px]">
                {hotel.HinhAnh.slice(1, 5).map((img, index) => (
                  <div key={img.MaHinhAnh} className="relative group overflow-hidden cursor-pointer rounded-lg">
                    <img 
                      src={img.URL} 
                      alt={`Ảnh ${index + 2}`} 
                      className={cn("w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out", index === 3 && "brightness-90")}
                    />
                    {index === 3 && hotel.HinhAnh.length > 5 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <button className="bg-white/95 text-ink font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
                          <i className="ph ph-squares-four text-base text-primary"></i>
                          <span>Xem tất cả {hotel.HinhAnh.length} ảnh</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <i className="ph-duotone ph-image text-4xl mr-2"></i> Chưa có hình ảnh
            </div>
          )}
        </div>
      </section>

      {/* STICKY PAGE TABS */}
      <div className="sticky top-[4.5rem] z-30 bg-white/95 backdrop-blur-md border-y border-border mt-3">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center space-x-8 overflow-x-auto no-scrollbar py-1">
            <a href="#tong-quan" className="nav-tab active py-4 border-b-2 border-transparent text-sm text-ink-muted hover:text-ink transition-all whitespace-nowrap">Tổng quan</a>
            <a href="#loai-phong" className="nav-tab py-4 border-b-2 border-transparent text-sm text-ink-muted hover:text-ink transition-all whitespace-nowrap">Loại phòng & Giá</a>
            <a href="#tien-nghi" className="nav-tab py-4 border-b-2 border-transparent text-sm text-ink-muted hover:text-ink transition-all whitespace-nowrap">Tiện nghi</a>
          </div>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-12">
            {/* OVERVIEW */}
            <section id="tong-quan" className="pt-2 scroll-mt-36">
              <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-md">
                <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight mb-4 flex items-center gap-2.5">
                  <i className="ph ph-info text-2xl text-primary"></i>
                  Tổng quan về {hotel.TenKhachSan}
                </h2>
                <p className="text-ink-muted text-sm sm:text-base leading-relaxed mb-4 whitespace-pre-line">
                  {hotel.MoTa ?? 'Khách sạn chưa cập nhật mô tả chi tiết.'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
                  {hotel.TienNghi.slice(0,4).map((a) => (
                    <div key={a.MaTienNghi} className="p-3 bg-surface-secondary rounded-xl border border-blue-100 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 text-primary flex items-center justify-center flex-shrink-0">
                        <i className="ph ph-check-circle text-base"></i>
                      </div>
                      <div className="text-xs font-bold text-ink">{a.TenTienNghi}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ROOM SELECTION LIST */}
            <section id="loai-phong" className="pt-2 scroll-mt-36">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
                    <i className="ph ph-bed text-2xl text-primary"></i>
                    Các loại phòng sẵn có
                  </h2>
                </div>
              </div>

              {/* SEARCH DATES FORM */}
              <div className="bg-white rounded-2xl border border-border p-5 mb-6 shadow-sm">
                <form onSubmit={handleSubmit(onDatesSubmit)} noValidate className="grid grid-cols-1 gap-3 sm:grid-cols-4 items-end">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Nhận phòng</label>
                    <Input type="date" {...register('checkIn')} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Trả phòng</label>
                    <Input type="date" error={errors.checkOut?.message} {...register('checkOut')} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Số khách</label>
                    <Input type="number" min={1} max={50} {...register('guests')} />
                  </div>
                  <button type="submit" className="w-full h-[42px] bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors text-sm">
                    Kiểm tra phòng
                  </button>
                </form>
              </div>

              {roomsQuery.isLoading ? (
                <div className="flex justify-center py-10"><div className="spinner"></div></div>
              ) : roomsQuery.isError ? (
                 <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">Không thể tải danh sách phòng</div>
              ) : roomsQuery.data && roomsQuery.data.length === 0 ? (
                 <div className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Không có loại phòng phù hợp.</div>
              ) : (
                <div className="space-y-6">
                  {roomsQuery.data?.map((room) => (
                    <div key={room.MaLoaiPhong} className={cn("bg-white rounded-2xl border p-5 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300 grid grid-cols-1 md:grid-cols-12 gap-6", selectedRoomId === room.MaLoaiPhong ? "border-primary ring-1 ring-primary" : "border-border", !room.ConHang && 'opacity-60 grayscale-[50%] pointer-events-none')}>
                      <div className="md:col-span-4 relative rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                        <i className="ph-duotone ph-image text-4xl text-slate-300"></i>
                      </div>
                      
                      <div className="md:col-span-5 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-ink">{room.TenLoaiPhong}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2.5 text-xs text-ink-muted">
                            <span className="flex items-center gap-1.5"><i className="ph ph-arrows-out text-sm"></i> {room.DienTich} m²</span>
                            <span className="flex items-center gap-1.5"><i className="ph ph-bed text-sm"></i> {room.LoaiGiuong}</span>
                            <span className="flex items-center gap-1.5"><i className="ph ph-user text-sm"></i> Tối đa {room.SucChua} khách</span>
                          </div>
                          {!room.ConHang && (
                            <div className="mt-3">
                              <span className="inline-block rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600">Hết phòng cho khoảng ngày đã chọn</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-3 flex flex-col justify-between md:items-end md:text-right border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                        <div>
                           {room.GiaTheoDem !== null ? (
                             <>
                              <div className="text-2xl font-extrabold text-primary tracking-tight">{formatCurrencyVND(room.GiaTheoDem)}</div>
                              <span className="text-[11px] text-ink-muted block">/phòng /đêm</span>
                             </>
                           ) : <span className="text-sm text-slate-500">Không có giá</span>}
                        </div>
                        <div className="mt-4 w-full">
                          <button disabled={!room.ConHang} onClick={() => selectRoom(room.MaLoaiPhong)} className={cn("w-full font-bold text-sm py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2", selectedRoomId === room.MaLoaiPhong ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-primary hover:bg-primary-700 text-white")}>
                            <span>{selectedRoomId === room.MaLoaiPhong ? 'Đang chọn' : 'Chọn phòng'}</span>
                            {selectedRoomId === room.MaLoaiPhong ? <i className="ph-bold ph-check text-base"></i> : <i className="ph-bold ph-arrow-right text-base"></i>}
                          </button>
                          {room.ConHang && <p className="text-[10px] text-ink-muted text-center mt-1.5">Còn {room.SoPhongConLai} phòng</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            
            {/* AMENITIES */}
            <section id="tien-nghi" className="pt-2 scroll-mt-36">
              <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
                      <i className="ph ph-sparkle text-2xl text-primary"></i>
                      Tiện nghi & Dịch vụ khách sạn
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {hotel.TienNghi.map((a) => (
                    <div key={a.MaTienNghi} className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-surface-secondary transition-colors">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary flex-shrink-0">
                        <i className="ph ph-check-circle text-xl"></i>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-ink">{a.TenTienNghi}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: BOOKING WIDGET */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 space-y-4">
              <div className="bg-white rounded-2xl border-2 border-primary/20 p-6 shadow-xl relative overflow-hidden">
                <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
                  <i className="ph-fill ph-receipt text-primary text-xl"></i>
                  Chi tiết đặt phòng
                </h2>
                
                {!selectedRoomId ? (
                   <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                     <i className="ph-duotone ph-hand-pointing text-3xl text-primary mb-2"></i>
                     <p className="text-sm font-medium text-blue-900">Vui lòng chọn loại phòng ở bên trái để tiếp tục đặt phòng.</p>
                   </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="text-sm font-bold text-ink">{selectedRoom?.TenLoaiPhong}</span>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-ink-muted">Số lượng</label>
                        <Input
                          type="number"
                          min={1}
                          max={selectedRoom?.SoPhongConLai || 50}
                          value={selectedQuantity}
                          onChange={(e) => setSelectedQuantity(Math.max(1, Number(e.target.value) || 1))}
                          className="w-16 h-8 text-sm"
                        />
                      </div>
                    </div>

                    {quoteMutation.isPending ? (
                       <div className="flex justify-center py-6"><div className="spinner"></div></div>
                    ) : quoteMutation.isError ? (
                       <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{quoteMutation.error instanceof ApiError ? quoteMutation.error.message : 'Lỗi tạo báo giá'}</div>
                    ) : quoteMutation.data ? (
                      <>
                        {!quoteMutation.data.KhaDung && (
                           <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                             Chỉ còn {quoteMutation.data.ChiTietPhong[0]?.SoPhongConLai ?? 0} phòng.
                           </div>
                        )}
                        <div className="space-y-2 border-b border-border pb-3 text-sm">
                          <div className="flex justify-between text-ink-muted">
                            <span>{quoteMutation.data.SoDem} đêm × {selectedQuantity} phòng</span>
                            <span>
                              {quoteMutation.data.ChiTietPhong[0]?.GiaTheoDem !== null
                                ? formatCurrencyVND(quoteMutation.data.ChiTietPhong[0]!.GiaTheoDem!) + '/đêm'
                                : '—'}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-ink">
                            <span>Tổng tiền phòng</span>
                            <span>{formatCurrencyVND(quoteMutation.data.TongTienPhong)}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-1 text-xs font-bold text-ink-muted uppercase tracking-wider">
                            <i className="ph-bold ph-tag"></i> Mã khuyến mãi
                          </label>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                              placeholder="Nhập mã (nếu có)"
                              className="uppercase h-10"
                            />
                            <button onClick={() => requestQuote(true)} disabled={!promoCode.trim()} className="h-10 px-4 bg-slate-900 text-white rounded-lg font-medium text-xs whitespace-nowrap disabled:opacity-50">
                              Áp dụng
                            </button>
                          </div>
                          {quoteMutation.data.PromoThongBao && (
                             <p className={cn('text-xs font-medium', quoteMutation.data.PromoHopLe ? 'text-emerald-600' : 'text-red-600')}>
                               {quoteMutation.data.PromoThongBao}
                             </p>
                          )}
                        </div>

                        {quoteMutation.data.PromoHopLe && (
                           <div className="flex justify-between text-sm text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                             <span>Khuyến mãi giảm</span>
                             <span>−{formatCurrencyVND(quoteMutation.data.SoTienGiam)}</span>
                           </div>
                        )}

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mt-2">
                           <div className="flex items-center justify-between">
                             <span className="font-bold text-ink">Tổng thanh toán</span>
                             <div className="text-right">
                               <span className="text-2xl font-black text-primary leading-none block">{formatCurrencyVND(quoteMutation.data.TongTienThanhToan)}</span>
                               <span className="text-[10px] text-primary/70 font-semibold uppercase">Đã bao gồm thuế phí</span>
                             </div>
                           </div>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-ink-muted">Ghi chú cho khách sạn</label>
                          <Textarea
                            rows={2}
                            value={ghiChu}
                            onChange={(e) => setGhiChu(e.target.value)}
                            placeholder="Ví dụ: đến muộn..."
                            className="text-sm"
                          />
                        </div>

                        {bookingMutation.isError && (
                          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                             {bookingMutation.error instanceof ApiError ? bookingMutation.error.message : 'Lỗi'}
                          </div>
                        )}

                        <div className="pt-2">
                          {!accessToken ? (
                            <button onClick={() => navigate('/login')} className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-md">
                              Đăng nhập để đặt phòng
                            </button>
                          ) : role !== ROLE_NAMES.CUSTOMER ? (
                            <div className="text-center">
                              <button disabled className="w-full h-12 bg-slate-300 text-slate-500 font-bold text-sm rounded-xl cursor-not-allowed">Xác nhận đặt phòng</button>
                              <p className="text-[11px] text-ink-muted mt-2">Dành cho tài khoản khách hàng</p>
                            </div>
                          ) : (
                            <button
                              onClick={confirmBooking}
                              disabled={!quoteMutation.data.KhaDung || bookingMutation.isPending}
                              className="w-full h-12 bg-primary hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                              {bookingMutation.isPending ? 'Đang xử lý...' : (
                                <>
                                  <span>Xác nhận đặt ngay</span>
                                  <i className="ph-bold ph-arrow-right"></i>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        
                        {quoteMutation.data.ChinhSachHuy && (
                           <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                             <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                               <i className="ph-fill ph-shield-check text-sm"></i>
                               {quoteMutation.data.ChinhSachHuy.TenChinhSach}
                             </div>
                             <ul className="text-[11px] text-emerald-700/80 pl-6 list-disc">
                               {quoteMutation.data.ChinhSachHuy.ChiTiet.map((tier, i) => (
                                 <li key={i}>Hủy trước {tier.SoGioTruocNhanPhong}h hoàn {tier.TyLeHoanTien}%</li>
                               ))}
                             </ul>
                           </div>
                        )}

                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
