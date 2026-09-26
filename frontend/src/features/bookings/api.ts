import { apiClient } from '../../services/apiClient';
import type { Booking, BookingDetail, BookingSummary, CancelBookingRequest, CreateBookingRequest } from './types';

export const createBooking = async (hotelId: number, payload: CreateBookingRequest): Promise<Booking> => {
  const res = await apiClient<Booking>(`/hotels/${hotelId}/bookings`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data as Booking;
};

export const listMyBookings = async (): Promise<BookingSummary[]> => {
  const res = await apiClient<BookingSummary[]>('/bookings');
  return res.data ?? [];
};

export const getBookingDetail = async (bookingId: number): Promise<BookingDetail> => {
  const res = await apiClient<BookingDetail>(`/bookings/${bookingId}`);
  return res.data as BookingDetail;
};

export const cancelBooking = async (bookingId: number, payload: CancelBookingRequest = {}): Promise<BookingDetail> => {
  const res = await apiClient<BookingDetail>(`/bookings/${bookingId}/cancel`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data as BookingDetail;
};
