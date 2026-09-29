import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMyHotels } from './hooks';
import type { OwnerHotel } from './types';

export function resolveOwnerHotelContext(hotels: OwnerHotel[], rawHotelId: string | null) {
  const requestedHotelId = rawHotelId ? Number(rawHotelId) : null;
  const requestedHotel = requestedHotelId ? hotels.find((item) => item.MaKhachSan === requestedHotelId) : undefined;
  const invalidHotelId = Boolean(rawHotelId && (!Number.isInteger(requestedHotelId) || !requestedHotel));
  const hotelId = requestedHotel?.MaKhachSan ?? (hotels.length === 1 && !rawHotelId ? hotels[0].MaKhachSan : null);
  const hotel = hotelId ? hotels.find((item) => item.MaKhachSan === hotelId) : undefined;
  return { hotel, hotelId, invalidHotelId };
}

export function useOwnerHotelContext() {
  const hotelsQuery = useMyHotels();
  const [params, setParams] = useSearchParams();
  const [contextWasInvalid, setContextWasInvalid] = useState(false);
  const rawHotelId = params.get('hotelId');
  const hotels = hotelsQuery.data ?? [];
  const { hotel, hotelId, invalidHotelId } = resolveOwnerHotelContext(hotels, rawHotelId);

  useEffect(() => {
    if (hotelsQuery.isLoading || !hotelsQuery.data) return;
    if (rawHotelId && invalidHotelId) {
      setContextWasInvalid(true);
      const next = new URLSearchParams(params);
      next.delete('hotelId');
      setParams(next, { replace: true });
      return;
    }
    if (!rawHotelId && hotelsQuery.data.length === 1) {
      const next = new URLSearchParams(params);
      next.set('hotelId', String(hotelsQuery.data[0].MaKhachSan));
      setParams(next, { replace: true });
    }
  }, [hotelsQuery.data, hotelsQuery.isLoading, invalidHotelId, params, rawHotelId, setParams]);

  const selectHotel = (value: string) => {
    setContextWasInvalid(false);
    const next = new URLSearchParams(params);
    if (value) next.set('hotelId', value);
    else next.delete('hotelId');
    setParams(next);
  };

  return { hotelsQuery, hotels, hotel, hotelId, invalidHotelId: invalidHotelId || contextWasInvalid, selectHotel };
}
