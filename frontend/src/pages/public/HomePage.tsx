import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSearchHotels } from '../../features/hotels/hooks';
import { useLocations } from '../../features/locations/hooks';
import { DEFAULT_GUESTS, defaultSearchDates } from '../../features/hotels/schemas';
import type { LocationSummary } from '../../features/hotels/types';
import { TravelSearchBar } from '../../components/hotels/TravelSearchBar';
import { HotelCard } from '../../components/hotels/HotelCard';
import { formatDateRangeVi } from '../../lib/utils';
import { PageSpinner } from '../../components/common/PageSpinner';

export default function HomePage() {
  const navigate = useNavigate();
  const defaults = useMemo(() => defaultSearchDates(), []);

  // Every number and card on this page comes from the API — nothing is hardcoded.
  const featured = useSearchHotels({ checkIn: defaults.checkIn, checkOut: defaults.checkOut, guests: DEFAULT_GUESTS, page: 1, limit: 4, sort: 'star_desc' });
  const locations = useLocations();
  const destinations = (locations.data ?? []).filter((l) => l.SoKhachSan > 0).sort((a, b) => b.SoKhachSan - a.SoKhachSan);
  const totalHotels = featured.data?.pagination.total;
  const heroImage = featured.data?.items.find((h) => h.AnhDaiDien)?.AnhDaiDien ?? null;

  const handleSearch = (values: { location?: string; checkIn: string; checkOut: string; guests: number }) => {
    const params = new URLSearchParams({ checkIn: values.checkIn, checkOut: values.checkOut, guests: String(values.guests) });
    if (values.location?.trim()) params.set('location', values.location.trim());
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div className="booking-flow">
      <section className="home-discovery" aria-labelledby="home-search-title">
        <div className="home-discovery__inner">
          <div className="home-discovery__copy">
            <p className="home-discovery__eyebrow">EGODE · LƯU TRÚ CHO CHUYẾN ĐI CỦA BẠN</p>
            <h1 id="home-search-title">Tìm nơi ở phù hợp cho hành trình sắp tới</h1>
            <p>So sánh khách sạn theo điểm đến, ngày lưu trú và số khách.</p>
          </div>
          <TravelSearchBar variant="expanded" currentSearch={{ checkIn: defaults.checkIn, checkOut: defaults.checkOut, guests: DEFAULT_GUESTS }} onSearch={handleSearch} />
          {heroImage && <img className="home-discovery__image" src={heroImage} alt="Khách sạn đang có trên Egode" />}
          {totalHotels !== undefined && <p className="home-discovery__context">{totalHotels} khách sạn đang nhận đặt phòng{destinations.length ? ` · ${destinations.length} điểm đến có chỗ nghỉ` : ''}</p>}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-white" aria-labelledby="home-destinations-title">
        <div className="page-container">
          <div className="mb-10 text-center lg:text-left">
            <h2 id="home-destinations-title" className="text-3xl font-bold text-ink mb-2">Điểm đến phổ biến</h2>
            <p className="text-ink-muted text-lg">Những địa phương có nhiều khách sạn đang nhận đặt phòng nhất</p>
          </div>
          {locations.isLoading ? (
            <PageSpinner label="Đang tải điểm đến..." className="py-12" />
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
        <div className="page-container">
          <div className="mb-10 flex flex-col sm:flex-row justify-between items-end gap-4 text-center sm:text-left">
            <div>
              <h2 id="home-featured-title" className="text-3xl font-bold text-ink mb-2">Khách sạn nổi bật</h2>
              <p className="text-ink-muted text-lg">Hạng sao cao nhất, giá cho ngày {formatDateRangeVi(defaults.checkIn, defaults.checkOut, ' → ')}</p>
            </div>
            <Link to="/hotels" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
              Xem tất cả <i className="ph ph-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>
          {featured.isLoading ? (
            <PageSpinner label="Đang tải khách sạn nổi bật..." className="py-12" />
          ) : featured.isError ? (
            <p role="alert" className="text-center text-sm text-rose-600">Không thể tải danh sách khách sạn.</p>
          ) : !featured.data?.items.length ? (
            <p className="text-center text-sm text-ink-muted">Chưa có khách sạn nào đang nhận đặt phòng.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {featured.data.items.map((hotel) => (
                <HotelCard key={hotel.MaKhachSan} hotel={hotel} search={`checkIn=${defaults.checkIn}&checkOut=${defaults.checkOut}&guests=${DEFAULT_GUESTS}`} />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

function DestinationCard({ destination }: { destination: LocationSummary }) {
  return (
    <Link to={`/hotels?location=${encodeURIComponent(destination.TenThanhPho)}`} className="group relative rounded-2xl overflow-hidden aspect-[4/5] block bg-surface-secondary">
      {destination.AnhDaiDien && (
        <img src={destination.AnhDaiDien} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-6 text-white">
        <h3 className="text-2xl font-bold mb-1">{destination.TenThanhPho}</h3>
        <p className="text-sm text-gray-200">{destination.SoKhachSan} khách sạn</p>
      </div>
    </Link>
  );
}
