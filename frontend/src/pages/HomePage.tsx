import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSearchHotels } from '../features/hotels/hooks';
import { useLocations } from '../features/locations/hooks';
import { defaultSearchDates } from '../features/hotels/schemas';
import type { HotelSearchItem, LocationSummary } from '../features/hotels/types';
import { formatCurrencyVND, toDateInputValue } from '../lib/utils';

export default function HomePage() {
  const navigate = useNavigate();
  const defaults = useMemo(() => defaultSearchDates(), []);
  const today = toDateInputValue(new Date());
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState(defaults.checkIn);
  const [checkOut, setCheckOut] = useState(defaults.checkOut);
  const [guests, setGuests] = useState(2);
  const [formError, setFormError] = useState<string | null>(null);

  // Every number and card on this page comes from the API — nothing is hardcoded.
  const featured = useSearchHotels({ checkIn: defaults.checkIn, checkOut: defaults.checkOut, guests: 1, page: 1, limit: 4, sort: 'star_desc' });
  const locations = useLocations();
  const destinations = (locations.data ?? []).filter((l) => l.SoKhachSan > 0).sort((a, b) => b.SoKhachSan - a.SoKhachSan);
  const totalHotels = featured.data?.pagination.total;
  const heroImage = featured.data?.items.find((h) => h.AnhDaiDien)?.AnhDaiDien ?? null;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setFormError('Ngày trả phòng phải sau ngày nhận phòng.');
      return;
    }
    if (!Number.isInteger(guests) || guests < 1 || guests > 50) {
      setFormError('Số khách phải từ 1 đến 50.');
      return;
    }
    setFormError(null);
    const params = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
    if (location.trim()) params.set('location', location.trim());
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div className="booking-flow">
      {/* Hero Section */}
      <section className="bg-surface-secondary pt-28 pb-32 lg:pt-36 lg:pb-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <h1 className="type-display mb-6 text-ink">
              Khám phá nơi lưu trú <span className="text-primary">phù hợp</span> với bạn
            </h1>
            <p className="text-lg text-ink-muted mb-8 leading-relaxed">
              Tìm kiếm và đặt phòng khách sạn, resort và homestay với giá cập nhật theo từng ngày. Trải nghiệm kỳ nghỉ đáng nhớ cùng Egode.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-ink-muted">
              {totalHotels !== undefined && (
                <div className="flex items-center gap-1.5"><i className="ph-fill ph-check-circle text-primary text-lg" aria-hidden="true"></i> {totalHotels} khách sạn đang nhận đặt phòng</div>
              )}
              {destinations.length > 0 && (
                <div className="flex items-center gap-1.5"><i className="ph-fill ph-check-circle text-primary text-lg" aria-hidden="true"></i> {destinations.length} điểm đến</div>
              )}
              <div className="flex items-center gap-1.5"><i className="ph-fill ph-check-circle text-primary text-lg" aria-hidden="true"></i> Thanh toán an toàn qua VNPAY</div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            {heroImage ? (
              <img src={heroImage} alt="Không gian nghỉ dưỡng tại một khách sạn trên Egode" className="rounded-2xl object-cover h-[450px] w-full shadow-xl" />
            ) : (
              <div className="rounded-xl h-[450px] w-full border border-border bg-surface-secondary" aria-hidden="true" />
            )}
          </div>
        </div>
      </section>

      {/* Booking Search Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 z-20">
        <form onSubmit={handleSearch} noValidate aria-label="Tìm kiếm khách sạn" className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-border">
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
            <div className="flex-1 w-full lg:px-4 py-2 lg:py-0 group">
              <div className="flex items-center gap-3">
                <i className="ph ph-map-pin text-2xl text-ink-muted group-focus-within:text-primary transition-colors" aria-hidden="true"></i>
                <div className="flex flex-col w-full">
                  <label htmlFor="home-location" className="text-xs font-semibold text-ink mb-1">Địa điểm</label>
                  <input id="home-location" type="text" list="home-location-options" placeholder="Bạn muốn đi đâu?" className="text-sm text-ink outline-none w-full bg-transparent placeholder-ink-muted" value={location} onChange={(e) => setLocation(e.target.value)} />
                  <datalist id="home-location-options">
                    {destinations.map((d) => <option key={d.MaDiaPhuong} value={d.TenThanhPho} />)}
                  </datalist>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full lg:px-4 py-3 lg:py-0 group">
              <div className="flex items-center gap-3">
                <i className="ph ph-calendar-blank text-2xl text-ink-muted group-focus-within:text-primary transition-colors" aria-hidden="true"></i>
                <div className="flex flex-col w-full">
                  <label htmlFor="home-checkin" className="text-xs font-semibold text-ink mb-1">Ngày nhận phòng</label>
                  <input id="home-checkin" type="date" min={today} className="text-sm text-ink outline-none w-full bg-transparent" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="flex-1 w-full lg:px-4 py-3 lg:py-0 group">
              <div className="flex items-center gap-3">
                <i className="ph ph-calendar-check text-2xl text-ink-muted group-focus-within:text-primary transition-colors" aria-hidden="true"></i>
                <div className="flex flex-col w-full">
                  <label htmlFor="home-checkout" className="text-xs font-semibold text-ink mb-1">Ngày trả phòng</label>
                  <input id="home-checkout" type="date" min={checkIn || today} className="text-sm text-ink outline-none w-full bg-transparent" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="flex-1 w-full lg:px-4 py-3 lg:py-0 group">
              <div className="flex items-center gap-3">
                <i className="ph ph-users text-2xl text-ink-muted group-focus-within:text-primary transition-colors" aria-hidden="true"></i>
                <div className="flex flex-col w-full">
                  <label htmlFor="home-guests" className="text-xs font-semibold text-ink mb-1">Số khách</label>
                  <input id="home-guests" type="number" min={1} max={50} className="text-sm text-ink outline-none w-full bg-transparent" value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
                </div>
              </div>
            </div>
            <div className="lg:pl-6 w-full lg:w-auto pt-4 lg:pt-0">
              <button type="submit" className="w-full bg-primary hover:bg-primary-700 text-white font-medium text-lg lg:text-base py-3 lg:py-4 px-8 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2">
                <i className="ph ph-magnifying-glass lg:hidden text-xl" aria-hidden="true"></i> Tìm kiếm
              </button>
            </div>
          </div>
          {formError && <p role="alert" className="mt-3 text-sm text-rose-600">{formError}</p>}
        </form>
      </div>

      {/* Popular Destinations */}
      <section className="py-20 bg-white" aria-labelledby="home-destinations-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center lg:text-left">
            <h2 id="home-destinations-title" className="text-3xl font-bold text-ink mb-2">Điểm đến phổ biến</h2>
            <p className="text-ink-muted text-lg">Những địa phương có nhiều khách sạn đang nhận đặt phòng nhất</p>
          </div>
          {locations.isLoading ? (
            <div className="flex justify-center py-12" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span className="sr-only">Đang tải điểm đến...</span></div>
          ) : locations.isError ? (
            <p role="alert" className="text-center text-sm text-rose-600">Không thể tải danh sách điểm đến.</p>
          ) : destinations.length === 0 ? (
            <p className="text-center text-sm text-ink-muted">Chưa có điểm đến nào có khách sạn đang hoạt động.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.slice(0, 4).map((d) => <DestinationCard key={d.MaDiaPhuong} destination={d} />)}
            </div>
          )}
        </div>
      </section>

      {/* Featured Hotels */}
      <section id="deals" className="py-20 bg-surface-secondary" aria-labelledby="home-featured-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col sm:flex-row justify-between items-end gap-4 text-center sm:text-left">
            <div>
              <h2 id="home-featured-title" className="text-3xl font-bold text-ink mb-2">Khách sạn nổi bật</h2>
              <p className="text-ink-muted text-lg">Hạng sao cao nhất, giá cho ngày {defaults.checkIn} → {defaults.checkOut}</p>
            </div>
            <Link to="/hotels" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
              Xem tất cả <i className="ph ph-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>
          {featured.isLoading ? (
            <div className="flex justify-center py-12" role="status" aria-live="polite"><div className="spinner" aria-hidden="true"></div><span className="sr-only">Đang tải khách sạn nổi bật...</span></div>
          ) : featured.isError ? (
            <p role="alert" className="text-center text-sm text-rose-600">Không thể tải danh sách khách sạn.</p>
          ) : !featured.data?.items.length ? (
            <p className="text-center text-sm text-ink-muted">Chưa có khách sạn nào đang nhận đặt phòng.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.data.items.map((hotel) => (
                <HotelCard key={hotel.MaKhachSan} hotel={hotel} search={`checkIn=${defaults.checkIn}&checkOut=${defaults.checkOut}`} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section — only claims the platform actually delivers */}
      <section className="py-20 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ink">Tại sao chọn Egode?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard icon="ph-shield-check" title="Thanh toán an toàn" desc="Thanh toán qua cổng VNPAY — Egode không lưu thông tin thẻ của bạn." />
            <BenefitCard icon="ph-magnifying-glass-plus" title="Tìm kiếm dễ dàng" desc="Lọc theo địa điểm, ngày, số khách, giá, hạng sao và tiện nghi." />
            <BenefitCard icon="ph-lightning" title="Xác nhận ngay" desc="Nhận mã xác nhận đặt phòng ngay khi thanh toán thành công." />
            <BenefitCard icon="ph-headset" title="Hỗ trợ trực tuyến" desc="Gửi yêu cầu hỗ trợ hoặc khiếu nại và theo dõi kết quả xử lý." />
          </div>
        </div>
      </section>
    </div>
  );
}

function DestinationCard({ destination }: { destination: LocationSummary }) {
  return (
    <Link to={`/hotels?location=${encodeURIComponent(destination.TenThanhPho)}`} className="group relative rounded-2xl overflow-hidden aspect-[4/5] block shadow-md bg-gradient-to-br from-primary/30 to-primary/5">
      {destination.AnhDaiDien && (
        <img src={destination.AnhDaiDien} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <h3 className="text-2xl font-bold mb-1">{destination.TenThanhPho}</h3>
        <p className="text-sm text-gray-200">{destination.SoKhachSan} khách sạn</p>
      </div>
    </Link>
  );
}

function HotelCard({ hotel, search }: { hotel: HotelSearchItem; search: string }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border shadow-md hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="relative h-48 w-full bg-surface-secondary">
        {hotel.AnhDaiDien ? (
          <img src={hotel.AnhDaiDien} alt={hotel.TenKhachSan} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-muted text-sm">Chưa có ảnh</div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-lg text-ink leading-tight line-clamp-2">{hotel.TenKhachSan}</h3>
          <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-md text-sm font-semibold whitespace-nowrap" aria-label={`${hotel.HangSao} sao`}>
            <i className="ph-fill ph-star" aria-hidden="true"></i> {hotel.HangSao}
          </div>
        </div>
        <p className="text-ink-muted text-sm mb-6 flex items-start gap-1">
          <i className="ph-fill ph-map-pin text-primary mt-0.5" aria-hidden="true"></i> {hotel.DiaPhuong.TenThanhPho}
        </p>
        <div className="mt-auto flex items-end justify-between">
          <div>
            {hotel.ConPhong && hotel.GiaTuDauTu !== null ? (
              <>
                <p className="text-xs text-ink-muted mb-0.5">Bắt đầu từ</p>
                <p className="font-bold text-lg text-primary">{formatCurrencyVND(hotel.GiaTuDauTu)} <span className="text-sm font-normal text-ink-muted">/ đêm</span></p>
              </>
            ) : (
              <p className="text-sm font-semibold text-rose-600">Hết phòng cho ngày này</p>
            )}
          </div>
          <Link to={`/hotels/${hotel.MaKhachSan}?${search}`} className="text-primary font-semibold text-sm hover:underline">Xem chi tiết</Link>
        </div>
      </div>
    </div>
  );
}

function BenefitCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="text-center p-6">
      <div className="w-16 h-16 mx-auto bg-surface-secondary rounded-2xl flex items-center justify-center text-3xl text-primary mb-6 shadow-sm">
        <i className={`ph ${icon}`} aria-hidden="true"></i>
      </div>
      <h3 className="font-bold text-lg mb-2 text-ink">{title}</h3>
      <p className="text-ink-muted text-sm">{desc}</p>
    </div>
  );
}
