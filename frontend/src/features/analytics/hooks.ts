import { useQuery } from '@tanstack/react-query';
import { getAdminAnalytics, getOwnerHotelAnalytics } from './api';
import type { DateRangeQuery } from './types';

export function useOwnerHotelAnalytics(hotelId: number, query: DateRangeQuery) {
  return useQuery({
    queryKey: ['owner', 'analytics', hotelId, query],
    queryFn: () => getOwnerHotelAnalytics(hotelId, query),
    enabled: Number.isFinite(hotelId) && hotelId > 0,
  });
}

export function useAdminAnalytics(query: DateRangeQuery) {
  return useQuery({
    queryKey: ['admin', 'analytics', query],
    queryFn: () => getAdminAnalytics(query),
  });
}
