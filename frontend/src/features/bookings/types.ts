/**
 * Booking Feature Domain Types (Foundation Definition)
 * Business use cases will be implemented in subsequent phases.
 */

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
}
