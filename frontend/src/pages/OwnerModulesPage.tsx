import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { BarChart3, BedDouble, CalendarDays, CircleDollarSign, Plus, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { OwnerHotelContextSelector, OwnerHotelScopeState } from '../components/owner/OwnerHotelContext';
import { BarList } from '../components/analytics/BarList';
import { StatusBadge } from '../components/domain/StatusBadge';
import { useCreateRoomType, useBulkUpsertRates, useRates, useRoomTypes } from '../features/owner/hooks';
import { useOwnerHotelAnalytics } from '../features/analytics/hooks';
import type { OwnerHotel, OwnerRoomType, RateItemInput } from '../features/owner/types';
import { useOwnerHotelContext } from '../features/owner/context';
import { formatCurrencyVND, toDateInputValue } from '../lib/utils';
import { ApiError } from '../services/apiClient';

function useScopedHotels() {
  const scope = useOwnerHotelContext();
  const state = <OwnerHotelScopeState loading={scope.hotelsQuery.isLoading} error={scope.hotelsQuery.error} empty={!scope.hotelsQuery.isLoading && !scope.hotelsQuery.error && scope.hotels.length === 0} invalid={scope.invalidHotelId} />;
  return { ...scope, state };
}

export function OwnerRoomTypesPage() {
  const scope = useScopedHotels();
  const roomTypes = useRoomTypes(scope.hotelId ?? 0);
  const create = useCreateRoomType(scope.hotelId ?? 0);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');
  const visible = (roomTypes.data ?? []).filter((item) => item.TenLoaiPhong.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFormError('');
    const data = new FormData(event.currentTarget);
    try {
      await create.mutateAsync({ TenLoaiPhong: String(data.get('name') ?? '').trim(), LoaiGiuong: String(data.get('bed') ?? '').trim(), SoGiuong: Number(data.get('beds')), SucChua: Number(data.get('capacity')), DienTich: Number(data.get('area')) });
      event.currentTarget.reset(); setAdding(false);
    } catch (error) { setFormError(error instanceof ApiError ? error.message : 'Không thể tạo loại phòng.'); }
  };
  return <main className="owner-module space-y-6">
    <header className="owner-module__header"><div className="owner-module__title"><span className="owner-module__icon"><BedDouble size={20} /></span><div><h1>Loại phòng</h1><p>Cấu hình các hạng phòng trong từng khách sạn.</p></div></div>{scope.hotelId && <button className="btn btn-primary" type="button" onClick={() => setAdding((value) => !value)}><Plus size={16} /> Thêm loại phòng</button>}</header>
    <OwnerHotelContextSelector hotels={scope.hotels} hotelId={scope.hotelId} onChange={scope.selectHotel} />
    {scope.state}
    {!scope.hotelsQuery.isLoading && !scope.hotelsQuery.error && !scope.invalidHotelId && !scope.hotelId && scope.hotels.length > 1 && <div className="owner-scope-state">Chọn khách sạn để xem các loại phòng trong module này.</div>}
    {scope.hotelId && <>
      <div className="owner-module__toolbar"><label className="owner-module__search"><Search size={17} /><input type="search" aria-label="Tìm loại phòng" placeholder="Tìm loại phòng" value={search} onChange={(event) => setSearch(event.target.value)} /></label><span>{roomTypes.data?.length ?? 0} loại phòng</span></div>
      {adding && <form className="owner-module__form" onSubmit={submit}><h2>Thêm loại phòng</h2>{formError && <p role="alert">{formError}</p>}<div className="owner-module__form-grid"><label>Tên loại phòng<input name="name" minLength={2} maxLength={150} required /></label><label>Loại giường<input name="bed" maxLength={50} required /></label><label>Số giường<input name="beds" type="number" min="1" defaultValue="1" required /></label><label>Sức chứa<input name="capacity" type="number" min="1" defaultValue="2" required /></label><label>Diện tích (m²)<input name="area" type="number" min="0.1" step="0.1" required /></label></div><button className="btn btn-primary" disabled={create.isPending}>{create.isPending ? 'Đang tạo…' : 'Tạo loại phòng'}</button></form>}
      {roomTypes.isLoading ? <div role="status" className="owner-scope-state">Đang tải loại phòng…</div> : roomTypes.isError ? <div className="owner-scope-state is-error" role="alert">{roomTypes.error instanceof ApiError ? roomTypes.error.message : 'Không thể tải loại phòng.'}</div> : visible.length === 0 ? <div className="owner-scope-state">{search ? 'Không có loại phòng khớp từ khóa.' : 'Khách sạn này chưa có loại phòng.'}</div> : <div className="owner-room-type-list">{visible.map((room) => <RoomTypeRow key={room.MaLoaiPhong} room={room} hotel={scope.hotel!} />)}</div>}
    </>}
  </main>;
}

function RoomTypeRow({ room, hotel }: { room: OwnerRoomType; hotel: OwnerHotel }) {
  return <Link className="owner-room-type-row" to={`/owner/room-types/${room.MaLoaiPhong}?hotelId=${hotel.MaKhachSan}`}><span className="owner-room-type-row__image">{room.HINH_ANH_LOAI_PHONG[0]?.URL ? <img src={room.HINH_ANH_LOAI_PHONG[0].URL} alt="" /> : <BedDouble size={21} aria-hidden="true" />}</span><span className="owner-room-type-row__main"><strong>{room.TenLoaiPhong}</strong><small>{room.SucChua} khách · {room.DienTich} m² · {room.SoGiuong} giường {room.LoaiGiuong}</small></span><StatusBadge domain="roomType" status={room.TrangThai} /><span className="owner-room-type-row__action">Chỉnh sửa <span aria-hidden="true">›</span></span></Link>;
}

export function OwnerInventoryPricingPage() {
  const scope = useScopedHotels();
  const roomTypesQuery = useRoomTypes(scope.hotelId ?? 0);
  const [params, setParams] = useSearchParams();
  const roomTypeId = Number(params.get('roomTypeId') ?? roomTypesQuery.data?.[0]?.MaLoaiPhong ?? 0);
  const roomType = roomTypesQuery.data?.find((item) => item.MaLoaiPhong === roomTypeId);
  const start = toDateInputValue(new Date());
  const endDate = new Date(); endDate.setDate(endDate.getDate() + 13);
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(toDateInputValue(endDate));
  const rates = useRates(roomType?.MaLoaiPhong ?? 0, from, to);
  const update = useBulkUpsertRates(roomType?.MaLoaiPhong ?? 0);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!roomTypesQuery.data?.length) return;
    const found = roomTypesQuery.data.some((item) => item.MaLoaiPhong === roomTypeId);
    if (!found) {
      const next = new URLSearchParams(params);
      next.set('roomTypeId', String(roomTypesQuery.data[0].MaLoaiPhong));
      setParams(next, { replace: true });
    }
  }, [params, roomTypeId, roomTypesQuery.data, setParams]);
  const rows = useMemo(() => rates.data ?? [], [rates.data]);
  const updateRange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('');
    if (!roomType || from > to) { setError('Chọn ngày hợp lệ và một loại phòng.'); return; }
    const days = Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000) + 1;
    if (days > 366) { setError('Mỗi lần cập nhật tối đa 366 ngày theo giới hạn hệ thống.'); return; }
    const data = new FormData(event.currentTarget);
    const ratesPayload: RateItemInput[] = Array.from({ length: days }, (_, index) => {
      const date = new Date(Date.parse(`${from}T00:00:00Z`) + index * 86400000).toISOString().slice(0, 10);
      return { NgayApDung: date, GiaPhong: Number(data.get('price')), SoLuongPhong: Number(data.get('quantity')), TrangThai: String(data.get('status')) };
    });
    try { await update.mutateAsync(ratesPayload); }
    catch (reason) { setError(reason instanceof ApiError ? reason.message : 'Không thể cập nhật giá và quỹ phòng.'); }
  };
  return <main className="owner-module space-y-6"><header className="owner-module__header"><div className="owner-module__title"><span className="owner-module__icon"><CalendarDays size={20} /></span><div><h1>Quỹ phòng &amp; giá bán</h1><p>Chỉnh sửa các mức giá và số lượng đã lưu theo ngày.</p></div></div></header>
    <OwnerHotelContextSelector hotels={scope.hotels} hotelId={scope.hotelId} onChange={scope.selectHotel} />{scope.state}
    {!scope.hotelsQuery.isLoading && !scope.hotelsQuery.error && !scope.invalidHotelId && !scope.hotelId && scope.hotels.length > 1 && <div className="owner-scope-state">Chọn khách sạn để tải dữ liệu quỹ phòng và giá bán.</div>}
    {scope.hotelId && <>{roomTypesQuery.isLoading ? <div role="status" className="owner-scope-state">Đang tải loại phòng…</div> : roomTypesQuery.isError ? <div role="alert" className="owner-scope-state is-error">Không thể tải loại phòng.</div> : roomTypesQuery.data?.length ? <>
      <section className="owner-module__filters"><label>Loại phòng<select aria-label="Loại phòng" value={roomType?.MaLoaiPhong ?? ''} onChange={(event) => { const next = new URLSearchParams(params); next.set('roomTypeId', event.target.value); setParams(next); }}><option value="" disabled>Chọn loại phòng</option>{roomTypesQuery.data.map((item) => <option key={item.MaLoaiPhong} value={item.MaLoaiPhong}>{item.TenLoaiPhong}</option>)}</select></label><label>Từ ngày<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label>Đến ngày<input type="date" min={from} value={to} onChange={(event) => setTo(event.target.value)} /></label></section>
      <section className="owner-module__data"><h2>{roomType?.TenLoaiPhong ?? 'Dữ liệu theo ngày'}</h2>{rates.isLoading ? <div role="status" className="owner-scope-state">Đang tải dữ liệu ngày…</div> : rates.isError ? <div role="alert" className="owner-scope-state is-error">{rates.error instanceof ApiError ? rates.error.message : 'Không thể tải dữ liệu ngày.'}</div> : rows.length ? <div className="owner-rate-table-wrap"><table className="owner-rate-table"><thead><tr><th>Ngày áp dụng</th><th>Giá phòng</th><th>Số lượng phòng</th><th>Trạng thái</th></tr></thead><tbody>{rows.map((row) => <tr key={row.MaQuyPhong}><td>{new Date(`${row.NgayApDung.slice(0, 10)}T00:00:00`).toLocaleDateString('vi-VN')}</td><td>{formatCurrencyVND(row.GiaPhong)}</td><td>{row.SoLuongPhong}</td><td>{row.TrangThai}</td></tr>)}</tbody></table></div> : <p className="owner-scope-state">Không có bản ghi giá/quỹ trong khoảng ngày này.</p>}</section>
      <form className="owner-module__form" onSubmit={updateRange}><h2>Cập nhật toàn bộ khoảng ngày đã chọn</h2><p>Gửi đúng ngày, giá, số lượng và trạng thái đến API hiện tại. Không tạo dữ liệu tồn kho suy diễn.</p>{error && <p role="alert" className="is-error">{error}</p>}<div className="owner-module__form-grid"><label>Giá phòng<input name="price" type="number" min="0" step="1000" required /></label><label>Số lượng phòng<input name="quantity" type="number" min="0" step="1" required /></label><label>Trạng thái<select name="status" defaultValue="Mở bán"><option value="Mở bán">Mở bán</option><option value="Đóng bán">Đóng bán</option></select></label></div><button className="btn btn-primary" disabled={update.isPending || !roomType}>{update.isPending ? 'Đang lưu…' : 'Cập nhật khoảng ngày'}</button></form>
    </> : <div className="owner-scope-state">Khách sạn này chưa có loại phòng để thiết lập giá.</div>}</>}
  </main>;
}

function OwnerAnalyticsModule({ mode }: { mode: 'revenue' | 'reports' }) {
  const scope = useScopedHotels();
  const [params, setParams] = useSearchParams();
  const [from, setFrom] = useState(params.get('from') ?? '');
  const [to, setTo] = useState(params.get('to') ?? '');
  const applied = { from: params.get('from') || undefined, to: params.get('to') || undefined };
  const analytics = useOwnerHotelAnalytics(scope.hotelId ?? 0, applied);
  const setRange = (event: FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams(params);
    if (from) next.set('from', from); else next.delete('from');
    if (to) next.set('to', to); else next.delete('to');
    setParams(next);
  };
  const data = analytics.data;
  const reports = mode === 'reports';
  return <main className="owner-module space-y-6"><header className="owner-module__header"><div className="owner-module__title"><span className="owner-module__icon">{reports ? <BarChart3 size={20} /> : <CircleDollarSign size={20} />}</span><div><h1>{reports ? 'Báo cáo thống kê' : 'Doanh thu'}</h1><p>{reports ? 'Theo dõi trạng thái đặt phòng, loại phòng phổ biến và tỷ lệ lấp đầy.' : 'Tổng hợp doanh thu thanh toán và khoản hoàn theo dữ liệu hệ thống.'}</p></div></div></header>
    <OwnerHotelContextSelector hotels={scope.hotels} hotelId={scope.hotelId} onChange={scope.selectHotel} />{scope.state}
    {!scope.hotelsQuery.isLoading && !scope.hotelsQuery.error && !scope.invalidHotelId && !scope.hotelId && scope.hotels.length > 1 && <div className="owner-scope-state">Chọn khách sạn để tải số liệu trong module này.</div>}
    {scope.hotelId && <><form className="owner-module__filters" onSubmit={setRange}><label>Từ ngày<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label>Đến ngày<input type="date" min={from || undefined} value={to} onChange={(event) => setTo(event.target.value)} /></label><button className="btn btn-secondary">Áp dụng khoảng ngày</button></form>
      {analytics.isLoading ? <div role="status" className="owner-scope-state">Đang tải dữ liệu…</div> : analytics.isError || !data ? <div role="alert" className="owner-scope-state is-error">{analytics.error instanceof ApiError ? analytics.error.message : 'Không thể tải dữ liệu phân tích.'}</div> : reports ? <>
        <section className="owner-metric-strip"><article><small>Tổng đặt phòng</small><strong>{data.TongSoBooking.toLocaleString('vi-VN')}</strong></article><article><small>Tỷ lệ lấp đầy</small><strong>{data.TyLeLapDay === null ? 'Chưa có dữ liệu' : `${data.TyLeLapDay}%`}</strong><span>{data.TongPhongDem.toLocaleString('vi-VN')} / {data.TongPhongCoTheBan.toLocaleString('vi-VN')} phòng-đêm</span></article></section>
        <div className="owner-module__report-grid"><section className="owner-module__data"><h2>Đặt phòng theo trạng thái</h2><BarList items={data.BookingTheoTrangThai.map((item) => ({ label: item.TrangThai, value: item.SoLuong }))} emptyMessage="Chưa có đặt phòng trong khoảng thời gian này" /></section><section className="owner-module__data"><h2>Loại phòng phổ biến</h2><BarList items={data.LoaiPhongPhoBien.map((item) => ({ label: item.TenLoaiPhong, value: item.SoLuongDaDat }))} emptyMessage="Chưa có dữ liệu loại phòng" /></section></div>
      </> : <><section className="owner-revenue-total"><span>Doanh thu thực nhận</span><strong>{formatCurrencyVND(data.DoanhThuThucNhan)}</strong><small>Doanh thu gộp {formatCurrencyVND(data.DoanhThuGop)} · Hoàn tiền {formatCurrencyVND(data.TongHoanTien)}</small></section><section className="owner-module__data"><h2>Tổng hợp trong kỳ</h2><dl className="owner-revenue-breakdown"><div><dt>Doanh thu gộp</dt><dd>{formatCurrencyVND(data.DoanhThuGop)}</dd></div><div><dt>Đã hoàn tiền</dt><dd>{formatCurrencyVND(data.TongHoanTien)}</dd></div><div><dt>Doanh thu thực nhận</dt><dd>{formatCurrencyVND(data.DoanhThuThucNhan)}</dd></div></dl><p className="owner-module__note">API hiện cung cấp số tổng hợp theo kỳ, chưa có chuỗi doanh thu theo ngày hoặc giao dịch chi tiết.</p></section></>}
    </>}
  </main>;
}

export function OwnerRevenuePage() { return <OwnerAnalyticsModule mode="revenue" />; }
export function OwnerReportsPage() { return <OwnerAnalyticsModule mode="reports" />; }
