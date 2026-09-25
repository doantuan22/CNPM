import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Hotel, MapPin, Star, SearchX } from 'lucide-react';
import { SearchForm } from '../components/hotels/SearchForm';
import { Button } from '../components/common/Button';
import { useSearchHotels } from '../features/hotels/hooks';
import { useAmenities } from '../features/amenities/hooks';
import { defaultSearchDates, SearchFormValues } from '../features/hotels/schemas';
import type { HotelSearchParams, SortOption } from '../features/hotels/types';
import { ApiError } from '../services/apiClient';
import { formatCurrencyVND, cn } from '../lib/utils';

const PAGE_SIZE = 12;

function parseParams(searchParams: URLSearchParams): HotelSearchParams {
  const defaults = defaultSearchDates();
  const amenitiesParam = searchParams.get('amenities');
  return {
    location: searchParams.get('location') || undefined,
    checkIn: searchParams.get('checkIn') || defaults.checkIn,
    checkOut: searchParams.get('checkOut') || defaults.checkOut,
    guests: Number(searchParams.get('guests')) || 1,
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

  const handleSearch = (values: SearchFormValues) => {
    updateParams({
      location: values.location || undefined,
      checkIn: values.checkIn,
      checkOut: values.checkOut,
      guests: String(values.guests),
    });
  };

  const toggleAmenity = (id: number) => {
    const current = params.amenities ?? [];
    const next = current.includes(id) ? current.filter((a) => a !== id) : [...current, id];
    updateParams({ amenities: next.length > 0 ? next.join(',') : undefined });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tìm kiếm khách sạn</h1>
        <p className="text-sm text-slate-500">
          {params.checkIn} → {params.checkOut} · {params.guests} khách
        </p>
      </div>

      <SearchForm
        initialValues={{
          location: params.location,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          guests: params.guests,
        }}
        onSubmit={handleSearch}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filters sidebar */}
        <aside className="space-y-5 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Khoảng giá / đêm</h2>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Từ"
                aria-label="Giá tối thiểu"
                defaultValue={params.minPrice ?? ''}
                onBlur={(e) => updateParams({ minPrice: e.target.value || undefined })}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
              <span className="text-slate-400">–</span>
              <input
                type="number"
                placeholder="Đến"
                aria-label="Giá tối đa"
                defaultValue={params.maxPrice ?? ''}
                onBlur={(e) => updateParams({ maxPrice: e.target.value || undefined })}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Hạng sao tối thiểu</h2>
            <div className="flex flex-wrap gap-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => updateParams({ starRating: params.starRating === star ? undefined : String(star) })}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
                    params.starRating === star
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {star}
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </button>
              ))}
            </div>
          </div>

          {amenitiesQuery.data && amenitiesQuery.data.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Tiện nghi</h2>
              <div className="space-y-2">
                {amenitiesQuery.data.map((a) => (
                  <label key={a.MaTienNghi} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={(params.amenities ?? []).includes(a.MaTienNghi)}
                      onChange={() => toggleAmenity(a.MaTienNghi)}
                      className="rounded border-slate-300"
                    />
                    {a.TenTienNghi}
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Results */}
        <div className="space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {query.data ? `${query.data.pagination.total} khách sạn phù hợp` : ''}
            </p>
            <select
              aria-label="Sắp xếp"
              value={params.sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            >
              <option value="price_asc">Giá: thấp đến cao</option>
              <option value="price_desc">Giá: cao đến thấp</option>
              <option value="star_desc">Hạng sao cao nhất</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>

          {query.isLoading ? (
            <div className="flex justify-center py-16" role="status" aria-live="polite">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            </div>
          ) : query.isError ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700">
              {query.error instanceof ApiError ? query.error.message : 'Không thể tải danh sách khách sạn'}
            </div>
          ) : query.data && query.data.items.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
              <SearchX className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                Không tìm thấy khách sạn phù hợp. Hãy thử điều chỉnh bộ lọc hoặc ngày lưu trú.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {query.data?.items.map((hotel) => (
                  <div
                    key={hotel.MaKhachSan}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
                  >
                    <div className="h-44 bg-slate-200">
                      {hotel.AnhDaiDien ? (
                        <img src={hotel.AnhDaiDien} alt={hotel.TenKhachSan} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <Hotel className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {hotel.HangSao} sao
                        </span>
                        {!hotel.ConPhong && (
                          <span className="text-xs font-medium text-red-600">Hết phòng</span>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold text-slate-900">{hotel.TenKhachSan}</h2>
                      <p className="flex items-center text-xs text-slate-500">
                        <MapPin className="mr-1 h-3.5 w-3.5" /> {hotel.DiaPhuong.TenThanhPho}
                      </p>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                        <div>
                          {hotel.GiaTuDauTu !== null ? (
                            <>
                              <span className="text-xs text-slate-500">Giá chỉ từ</span>
                              <p className="text-base font-bold text-blue-600">
                                {formatCurrencyVND(hotel.GiaTuDauTu)}{' '}
                                <span className="text-xs font-normal text-slate-500">/đêm</span>
                              </p>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">Không có giá cho ngày đã chọn</span>
                          )}
                        </div>
                        <Button size="sm" asChild>
                          <Link
                            to={`/hotels/${hotel.MaKhachSan}?checkIn=${params.checkIn}&checkOut=${params.checkOut}&guests=${params.guests}`}
                          >
                            Xem chi tiết
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {query.data && query.data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    type="button"
                    disabled={params.page <= 1}
                    onClick={() => updateParams({ page: String(params.page - 1) }, false)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <span className="text-sm text-slate-600">
                    Trang {query.data.pagination.page}/{query.data.pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={params.page >= query.data.pagination.totalPages}
                    onClick={() => updateParams({ page: String(params.page + 1) }, false)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
