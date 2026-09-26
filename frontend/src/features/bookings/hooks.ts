import { useMutation } from '@tanstack/react-query';
import { createBooking } from './api';
import type { CreateBookingRequest } from './types';

export function useCreateBooking(hotelId: number) {
  return useMutation({
    mutationFn: (payload: CreateBookingRequest) => createBooking(hotelId, payload),
  });
}
