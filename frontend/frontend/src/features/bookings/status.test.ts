import { describe, expect, it } from 'vitest';
import {
  BOOKING_STATUS,
  BOOKING_TABS,
  CANCELLABLE_BOOKING_STATUSES,
  canReviewBooking,
  getBookingTab,
  matchesBookingTab,
} from './status';

describe('getBookingTab', () => {
  it.each([
    ['Chờ thanh toán', 'Chờ thanh toán'],
    ['Đã xác nhận', 'Đã xác nhận'],
    ['Hoàn tất', 'Hoàn tất'],
    ['Đã hủy', 'Đã hủy'],
  ])('maps the backend status %s to its own tab', (status, tab) => {
    expect(getBookingTab(status)).toBe(tab);
  });

  it('does not map a payment status or an unknown status to any tab', () => {
    expect(getBookingTab('Thành công')).toBeNull();
    expect(getBookingTab('Trạng thái lạ')).toBeNull();
  });
});

describe('matchesBookingTab', () => {
  it('"all" shows every booking, including an unknown status', () => {
    expect(matchesBookingTab('Trạng thái lạ', 'all')).toBe(true);
    expect(matchesBookingTab('Đã xác nhận', 'all')).toBe(true);
  });

  it('a status tab only shows bookings with exactly that status', () => {
    expect(matchesBookingTab('Đã xác nhận', 'Hoàn tất')).toBe(false);
    expect(matchesBookingTab('Hoàn tất', 'Hoàn tất')).toBe(true);
    expect(matchesBookingTab('Trạng thái lạ', 'Hoàn tất')).toBe(false);
  });
});

describe('canReviewBooking', () => {
  it('is only true for a completed stay', () => {
    expect(canReviewBooking(BOOKING_STATUS.COMPLETED)).toBe(true);
    expect(canReviewBooking(BOOKING_STATUS.CONFIRMED)).toBe(false);
    expect(canReviewBooking(BOOKING_STATUS.PENDING_PAYMENT)).toBe(false);
    expect(canReviewBooking(BOOKING_STATUS.CANCELLED)).toBe(false);
    expect(canReviewBooking('Trạng thái lạ')).toBe(false);
  });
});

describe('booking status constants', () => {
  it('can be cancelled only while pending payment or confirmed', () => {
    expect([...CANCELLABLE_BOOKING_STATUSES]).toEqual(['Chờ thanh toán', 'Đã xác nhận']);
  });

  it('has one tab per backend status plus "all"', () => {
    expect(BOOKING_TABS.map((tab) => tab.key)).toEqual(['all', 'Chờ thanh toán', 'Đã xác nhận', 'Hoàn tất', 'Đã hủy']);
  });
});
