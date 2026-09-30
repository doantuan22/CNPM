import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchHotels } from '../../features/hotels/hooks';
import { useAmenities } from '../../features/amenities/hooks';
import { defaultSearchDates, parseGuests } from '../../features/hotels/schemas';
import type { HotelSearchParams, SortOption } from '../../features/hotels/types';
import { ApiError } from '../../services/apiClient';
import { cn, formatDateRangeVi } from '../../lib/utils';
import { TravelSearchBar } from '../../components/hotels/TravelSearchBar';
import { HotelCard } from '../../components/hotels/HotelCard';
import { PageSpinner } from '../../components/common/PageSpinner';

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
  
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);

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
        <div className="flex flex-col lg:flex-row items-start gap-8">
          
          {/* SIDEBAR: BỘ LỌC TÌM KIẾM */}
          <button type="button" className="hotel-filter-toggle lg:hidden" aria-expanded={areFiltersOpen} aria-controls="hotel-search-filters" onClick={() => setAreFiltersOpen((open) => !open)}>
            <span><i className="ph-bold ph-faders mr-2" aria-hidden="true"></i>Bộ lọc tìm kiếm</span>
            <span className="text-primary">{areFiltersOpen ? 'Ẩn bộ lọc' : 'Mở bộ lọc'}</span>
          </button>
          <aside id="hotel-search-filters" className={`hotel-search-filters w-full lg:w-[290px] shrink-0 lg:sticky lg:top-40 space-y-6 ${areFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <i className="ph-bold ph-faders text-lg text-primary"></i>
                <h2 className="text-base font-bold text-slate-900">Bộ Lọc</h2>
              </div>
              <button onClick={resetFilters} className="text-xs font-semibold text-primary hover:text-blue-700 transition-colors">
                Đặt lại tất cả
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p id="hotel-list-price-label" className="text-xs font-bold uppercase tracking-wider text-slate-500">Khoảng Giá (VND)</p>
                <span className="text-[11px] text-slate-400 font-medium">/ mỗi đêm</span>
              </div>
              <div role="group" aria-labelledby="hotel-list-price-label" className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <label htmlFor="hotel-list-min-price" className="text-[10px] text-slate-400 block font-medium">Tối thiểu</label>
                  <input id="hotel-list-min-price" key={`min-${params.minPrice ?? ""}`} type="number" min={0} className="w-full bg-transparent font-bold text-slate-700 outline-none" placeholder="0" defaultValue={params.minPrice} onBlur={(e) => updateParams({ minPrice: e.target.value || undefined })} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-right">
                  <label htmlFor="hotel-list-max-price" className="text-[10px] text-slate-400 block font-medium">Tối đa</label>
                  <input id="hotel-list-max-price" key={`max-${params.maxPrice ?? ""}`} type="number" min={0} className="w-full bg-transparent font-bold text-primary text-right outline-none" placeholder="Bất kỳ" defaultValue={params.maxPrice} onBlur={(e) => updateParams({ maxPrice: e.target.value || undefined })} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <p id="hotel-list-star-label" className="text-xs font-bold uppercase tracking-wider text-slate-500">Hạng Sao</p>
              <div role="group" aria-labelledby="hotel-list-star-label" className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <label key={star} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <input type="checkbox" checked={params.starRating === star} onChange={() => updateParams({ starRating: params.starRating === star ? undefined : String(star) })} className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300" />
                      <div className="flex items-center text-amber-400 text-sm gap-0.5">
                        {Array(5).fill(0).map((_, i) => (
                          <i key={i} className={cn("ph-fill ph-star", i >= star && "text-slate-300 ph")}></i>
                        ))}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {amenitiesQuery.data && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <p id="hotel-list-amenity-label" className="text-xs font-bold uppercase tracking-wider text-slate-500">Tiện Nghi</p>
                <div role="group" aria-labelledby="hotel-list-amenity-label" className="space-y-2 text-sm text-slate-700">
                  {amenitiesQuery.data.map((a) => (
                    <label key={a.MaTienNghi} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                      <input type="checkbox" checked={(params.amenities ?? []).includes(a.MaTienNghi)} onChange={() => toggleAmenity(a.MaTienNghi)} className="w-4 h-4 rounded text-primary border-slate-300" />
                      <span className="text-xs font-medium">{a.TenTienNghi}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* RESULTS LIST */}
          <section className="flex-1 w-full space-y-5">
            <div className="hotel-results-toolbar flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900">Tìm thấy <span className="text-primary">{query.data?.pagination.total ?? 0}</span> khách sạn</h1>
                  {params.location && <span className="text-xs text-slate-400 font-medium">• {params.location}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {params.location && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-primary text-xs font-medium"><i className="ph ph-map-pin"></i> {params.location}</span>}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium"><i className="ph ph-calendar"></i> {formatDateRangeVi(params.checkIn, params.checkOut, ' - ')}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sắp xếp theo:</span>
                <div className="relative">
                  <select value={params.sort} onChange={(e) => updateParams({ sort: e.target.value })} className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all">
                    <option value="price_asc">Giá thấp đến cao</option>
                    <option value="price_desc">Giá cao đến thấp</option>
                    <option value="star_desc">Hạng sao cao nhất</option>
                    <option value="newest">Mới nhất</option>
                  </select>
                  <i className="ph-bold ph-caret-down absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none"></i>
                </div>
              </div>
            </div>

            {query.isLoading ? (
              <PageSpinner />
            ) : query.isError ? (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700">
                {query.error instanceof ApiError ? query.error.message : 'Không thể tải danh sách khách sạn'}
              </div>
            ) : query.data && query.data.items.length === 0 ? (
              <div className="empty-state bg-white rounded-2xl border border-border">
                <i className="ph-duotone ph-magnifying-glass-minus text-5xl"></i>
                <div className="empty-state__title">Không tìm thấy khách sạn phù hợp</div>
                <div className="empty-state__desc">Hãy thử thay đổi tiêu chí tìm kiếm hoặc xóa các bộ lọc để xem thêm kết quả.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {query.data?.items.map((hotel) => <HotelCard key={hotel.MaKhachSan} hotel={hotel} search={`checkIn=${params.checkIn}&checkOut=${params.checkOut}&guests=${params.guests}`} />)}
              </div>
            )}

            {query.data && query.data.pagination.totalPages > 1 && (
              <div className="pt-6 pb-12 flex flex-col items-center gap-4">
                <div className="pagination bg-white p-1.5 rounded-2xl border border-border shadow-sm">
                  <button disabled={params.page <= 1} onClick={() => updateParams({ page: String(params.page - 1) }, false)}><i className="ph-bold ph-caret-left"></i></button>
                  <button className="active">{params.page}</button>
                  <span className="w-7 text-center text-xs text-slate-400">/ {query.data.pagination.totalPages}</span>
                  <button disabled={params.page >= query.data.pagination.totalPages} onClick={() => updateParams({ page: String(params.page + 1) }, false)}><i className="ph-bold ph-caret-right"></i></button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
