import { apiClient } from '../../services/apiClient';
import type { Quote, QuoteRequest } from './types';

export const createQuote = async (hotelId: number, payload: QuoteRequest): Promise<Quote> => {
  const res = await apiClient<Quote>(`/hotels/${hotelId}/quote`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data as Quote;
};
