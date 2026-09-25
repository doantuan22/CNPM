import { useQuery, keepPreviousData } from '@tanstack/react-query';
import * as hotelsApi from './api';
import type { HotelSearchParams, RoomsQueryParams } from './types';

export function useSearchHotels(params: HotelSearchParams) {
  return useQuery({
    queryKey: ['hotels', 'search', params],
    queryFn: () => hotelsApi.searchHotels(params),
    placeholderData: keepPreviousData,
  });
}

export function useHotelDetail(id: number) {
  return useQuery({
    queryKey: ['hotels', 'detail', id],
    queryFn: () => hotelsApi.getHotelDetail(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useHotelRooms(id: number, params: RoomsQueryParams) {
  return useQuery({
    queryKey: ['hotels', 'rooms', id, params],
    queryFn: () => hotelsApi.getHotelRooms(id, params),
    enabled: Number.isFinite(id) && id > 0 && !!params.checkIn && !!params.checkOut,
    placeholderData: keepPreviousData,
  });
}
