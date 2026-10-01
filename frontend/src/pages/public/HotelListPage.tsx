import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchHotels } from '../../features/hotels/hooks';
import { useAmenities } from '../../features/amenities/hooks';
import { defaultSearchDates, parseGuests } from '../../features/hotels/schemas';
import type { HotelSearchParams, SortOption } from '../../features/hotels/types';
import { ApiError } from '../../services/apiClient';
import { formatDateRangeVi } from '../../lib/utils';
import { TravelSearchBar } from '../../components/hotels/TravelSearchBar';
import { HotelCard } from '../../components/hotels/HotelCard';
import { HotelFilterBar } from '../../components/hotels/HotelFilterBar';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon } from '../../components/common/Icon';
import { Select } from '../../components/common/Select';
import { Skeleton } from '../../components/common/Skeleton';

const PAGE_SIZE = 12;

function parseParams(searchParams: URLSearchParams): HotelSearchParams {
  const defaults = defaultSearchDates();
  const amenitiesParam = searchParams.get('amenities');
  return {
    location: searchParams.get('location') || undefined,
    checkIn: searchParams.get('checkIn') || defaults.checkIn,
    checkOut: searchParams.get('checkOut') || defaults.checkOut,
    guests: parseGuests(searchParams.get('guests')),
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    starRating: searchParams.get('starRating') ? Number(searchParams.get('starRating')) : undefined,
    amenities: amenitiesParam ? amenitiesParam.split(',').map(Number) : undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: PAGE_SIZE,
    sort: (searchParams.get('sort') as SortOption) || 'price_asc',
  };
}

export default function HotelListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(() => parseParams(searchParams), [searchParams]);
  const query = useSearchHotels(params);
  const amenitiesQuery = useAmenities();
  
  const updateParams = (patch: Record<string, string | undefined>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === '') next.delete(key);
      else next.set(key, value);
    });
    if (resetPage) next.delete('page');
    setSearchParams(next);
  };

  const toggleAmenity = (id: number) => {
    const current = params.amenities ?? [];
    const next = current.includes(id) ? current.filter((a) => a !== id) : [...current, id];
    updateParams({ amenities: next.length > 0 ? next.join(',') : undefined });
  };
  
  const resetFilters = () => {
    updateParams({ minPrice: undefined, maxPrice: undefined, starRating: undefined, amenities: undefined });
  };

  return (
    <div className="booking-flow bg-surface-secondary text-ink min-h-[80vh] flex flex-col w-full">
      
      {/* Persistent search context: edits remain draft until explicit submit. */}
      <section className="bg-surface-secondary border-b border-border py-3.5 sticky top-[4.5rem] z-30">
        <div className="page-container">
          <TravelSearchBar
            variant="compact"
            currentSearch={{ location: params.location, checkIn: params.checkIn, checkOut: params.checkOut, guests: params.guests }}
            loading={query.isFetching}
            onSearch={(values) => updateParams({
              location: values.location || undefined,
              checkIn: values.checkIn,
              checkOut: values.checkOut,
              guests: String(values.guests),
            })}
          />
        </div>
      </section>

      <div className="hotel-results-page page-container py-8 flex-1 w-full">
        <div className="flex flex-col gap-5">
          <HotelFilterBar
            values={params}
            amenities={amenitiesQuery.data}
            onPriceChange={(key, value) => updateParams({ [key]: value })}
            onStarChange={(star) => updateParams({ starRating: star === undefined ? undefined : String(star) })}
            onAmenityToggle={toggleAmenity}
            onReset={resetFilters}
          />

          <section className="w-full space-y-5">
            <div className="hotel-results-toolbar flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-ink" aria-live="polite">Tìm thấy <span className="text-primary">{query.data?.pagination.total ?? 0}</span> khách sạn</h1>
                  {params.location && <span className="text-xs text-ink-muted font-medium">• {params.location}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {params.location && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary text-xs font-medium"><Icon name="map-pin" /> {params.location}</span>}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-tertiary text-ink-sub text-xs font-medium"><Icon name="calendar" /> {formatDateRangeVi(params.checkIn, params.checkOut, ' - ')}</span>
                </div>
              </div>
              <div className="w-full md:w-56 shrink-0">
                <Select label="Sắp xếp theo" value={params.sort} onChange={(e) => updateParams({ sort: e.target.value })}>
                  <option value="price_asc">Giá thấp đến cao</option>
                  <option value="price_desc">Giá cao đến thấp</option>
                  <option value="star_desc">Hạng sao cao nhất</option>
                  <option value="newest">Mới nhất</option>
                </Select>
              </div>
            </div>

            {query.isLoading ? (
              <HotelCardSkeletons />
            ) : query.isError ? (
              <div role="alert" className="rounded-xl border border-danger/30 bg-danger-light px-6 py-10 text-center text-sm text-danger-ink">
                {query.error instanceof ApiError ? query.error.message : 'Không thể tải danh sách khách sạn'}
              </div>
            ) : query.data && query.data.items.length === 0 ? (
              <div className="surface-card">
                <EmptyState
                  icon="magnifying-glass-minus"
                  title="Không tìm thấy khách sạn phù hợp"
                  description="Hãy thử thay đổi tiêu chí tìm kiếm hoặc xóa các bộ lọc để xem thêm kết quả."
                  action={<Button type="button" variant="outline" onClick={resetFilters}>Xóa bộ lọc</Button>}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {query.data?.items.map((hotel) => <HotelCard key={hotel.MaKhachSan} hotel={hotel} search={`checkIn=${params.checkIn}&checkOut=${params.checkOut}&guests=${params.guests}`} />)}
              </div>
            )}

            {query.data && query.data.pagination.totalPages > 1 && (
              <div className="pt-6 pb-12 flex flex-col items-center gap-4">
                <nav aria-label="Phân trang kết quả" className="pagination surface-card p-1.5">
                  <button type="button" aria-label="Trang trước" disabled={params.page <= 1} onClick={() => updateParams({ page: String(params.page - 1) }, false)}><Icon name="caret-left" weight="bold" /></button>
                  <span aria-current="page" className="px-3 text-sm font-semibold text-ink">{params.page}</span>
                  <span className="w-7 text-center text-xs text-ink-muted">/ {query.data.pagination.totalPages}</span>
                  <button type="button" aria-label="Trang sau" disabled={params.page >= query.data.pagination.totalPages} onClick={() => updateParams({ page: String(params.page + 1) }, false)}><Icon name="caret-right" weight="bold" /></button>
                </nav>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/** Same footprint as a HotelCard so the page does not jump when results arrive. */
function HotelCardSkeletons() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <span className="sr-only">Đang tải danh sách khách sạn...</span>
      {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
    </div>
  );
}
