import { apiClient } from '../../services/apiClient';
import type { Booking, CreateBookingRequest } from './types';

export const createBooking = async (hotelId: number, payload: CreateBookingRequest): Promise<Booking> => {
  const res = await apiClient<Booking>(`/hotels/${hotelId}/bookings`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data as Booking;
};
