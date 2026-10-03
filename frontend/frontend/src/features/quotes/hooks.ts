import { useQuery } from '@tanstack/react-query';
import { createQuote } from './api';
import type { QuoteRequest } from './types';

/**
 * Price and availability quote for a stay. The request is the query key, so choosing other rooms, other
 * dates or another promo code is simply another query (the previous request is dropped, no manual
 * refetching). It is idle while `request` is null (nothing selected). Availability and prices change, so a
 * cached quote is always re-checked, and a failed quote is a business answer (sold out, invalid dates):
 * retrying it would only delay the message.
 */
export function useQuote(hotelId: number, request: QuoteRequest | null) {
  return useQuery({
    queryKey: ['quotes', hotelId, request],
    queryFn: () => createQuote(hotelId, request as QuoteRequest),
    enabled: request !== null && hotelId > 0,
    retry: false,
    staleTime: 0,
    gcTime: 60_000,
  });
}
