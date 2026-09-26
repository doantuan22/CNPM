import { apiClient } from '../../services/apiClient';
import type { AdminAnalytics, DateRangeQuery, OwnerAnalytics } from './types';

const buildQuery = (query: DateRangeQuery): string => {
  const params = new URLSearchParams();
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);
  return params.toString();
};

export const getOwnerHotelAnalytics = async (hotelId: number, query: DateRangeQuery): Promise<OwnerAnalytics> => {
  const res = await apiClient<OwnerAnalytics>(`/owner/hotels/${hotelId}/analytics?${buildQuery(query)}`);
  return res.data as OwnerAnalytics;
};

export const getAdminAnalytics = async (query: DateRangeQuery): Promise<AdminAnalytics> => {
  const res = await apiClient<AdminAnalytics>(`/admin/analytics?${buildQuery(query)}`);
  return res.data as AdminAnalytics;
};
