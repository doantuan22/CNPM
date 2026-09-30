import { describe, it, expect } from 'vitest';
import { paymentDeadlineOf, paymentHold } from './booking-expiry';
import { BOOKING_STATUS } from '../../common/constants/hotel-status';

const created = new Date('2030-01-01T10:00:00.000Z');

describe('paymentDeadlineOf', () => {
  it('is NgayTao plus the payment timeout — the same instant after which expireStalePendingBookings cancels the booking', () => {
    expect(paymentDeadlineOf(created, 15).toISOString()).toBe('2030-01-01T10:15:00.000Z');
    expect(paymentDeadlineOf(created, 1.5).toISOString()).toBe('2030-01-01T10:01:30.000Z');
  });
});

describe('paymentHold', () => {
  it('gives the deadline and the seconds left, computed by the server clock, for a booking waiting for payment', () => {
    const now = new Date('2030-01-01T10:05:30.000Z');
    expect(paymentHold(created, BOOKING_STATUS.PENDING_PAYMENT, now, 15)).toEqual({
      HanThanhToan: '2030-01-01T10:15:00.000Z',
      SoGiayConLai: 570,
    });
  });

  it('rounds a partial second up, so the customer is never told the hold ended before it did', () => {
    const now = new Date('2030-01-01T10:14:59.400Z');
    expect(paymentHold(created, BOOKING_STATUS.PENDING_PAYMENT, now, 15).SoGiayConLai).toBe(1);
  });

  it('never goes below zero once the deadline has passed (the booking is cancelled on the next read)', () => {
    const now = new Date('2030-01-01T11:00:00.000Z');
    expect(paymentHold(created, BOOKING_STATUS.PENDING_PAYMENT, now, 15)).toEqual({ HanThanhToan: '2030-01-01T10:15:00.000Z', SoGiayConLai: 0 });
  });

  it.each([BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED])(
    'has no hold for a booking that is %s',
    (status) => {
      expect(paymentHold(created, status, new Date('2030-01-01T10:01:00.000Z'), 15)).toEqual({ HanThanhToan: null, SoGiayConLai: null });
    }
  );
});
