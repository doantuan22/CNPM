import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelBooking, createBooking, getBookingDetail, listMyBookings } from './api';
import type { CancelBookingRequest, CreateBookingRequest } from './types';

export function useCreateBooking(hotelId: number) {
  return useMutation({
    mutationFn: (payload: CreateBookingRequest) => createBooking(hotelId, payload),
  });
}

export function useMyBookings() {
  return useQuery({ queryKey: ['bookings'], queryFn: listMyBookings });
}

export function useBookingDetail(bookingId: number) {
  return useQuery({
    queryKey: ['bookings', bookingId],
    queryFn: () => getBookingDetail(bookingId),
    enabled: Number.isFinite(bookingId) && bookingId > 0,
  });
}

export function useCancelBooking(bookingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CancelBookingRequest = {}) => cancelBooking(bookingId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['bookings', bookingId], updated);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
