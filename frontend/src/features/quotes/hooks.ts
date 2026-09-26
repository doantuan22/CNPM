import { useMutation } from '@tanstack/react-query';
import { createQuote } from './api';
import type { QuoteRequest } from './types';

export function useCreateQuote(hotelId: number) {
  return useMutation({
    mutationFn: (payload: QuoteRequest) => createQuote(hotelId, payload),
  });
}
