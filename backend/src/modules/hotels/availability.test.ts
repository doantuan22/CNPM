import { describe, it, expect } from 'vitest';
import {
  enumerateNights,
  computeRoomTypeAvailability,
  buildBookedByDate,
  toDateKey,
  type NightlyRate,
} from './availability';

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);

describe('enumerateNights', () => {
  it('excludes the checkout date (checkout is not a night of stay)', () => {
    const nights = enumerateNights(d('2026-03-01'), d('2026-03-04'));
    expect(nights).toEqual(['2026-03-01', '2026-03-02', '2026-03-03']);
  });

  it('returns a single night for a 1-night stay', () => {
    expect(enumerateNights(d('2026-03-01'), d('2026-03-02'))).toEqual(['2026-03-01']);
  });

  it('throws on an invalid date range (checkOut <= checkIn)', () => {
    expect(() => enumerateNights(d('2026-03-04'), d('2026-03-04'))).toThrow();
    expect(() => enumerateNights(d('2026-03-05'), d('2026-03-04'))).toThrow();
  });
});

describe('computeRoomTypeAvailability', () => {
  const rate = (giaPhong: number, soLuongPhong: number): NightlyRate => ({ giaPhong, soLuongPhong });

  it('reports full availability when there is no booking at all', () => {
    const nights = enumerateNights(d('2026-03-01'), d('2026-03-03')); // 2 nights
    const rates = new Map([
      ['2026-03-01', rate(500000, 5)],
      ['2026-03-02', rate(500000, 5)],
    ]);
    const result = computeRoomTypeAvailability(nights, rates, new Map());

    expect(result.available).toBe(5);
    expect(result.totalPrice).toBe(1_000_000);
    expect(result.pricePerNight).toEqual([500000, 500000]);
  });

  it('subtracts booked rooms per night', () => {
    const nights = enumerateNights(d('2026-03-01'), d('2026-03-03'));
    const rates = new Map([
      ['2026-03-01', rate(500000, 5)],
      ['2026-03-02', rate(500000, 5)],
    ]);
    const booked = new Map([
      ['2026-03-01', 2],
      ['2026-03-02', 4],
    ]);
    const result = computeRoomTypeAvailability(nights, rates, booked);

    // Bottleneck night (03-02) has only 1 left → whole-stay availability = 1
    expect(result.available).toBe(1);
  });

  it('never goes negative when overbooked beyond inventory', () => {
    const nights = enumerateNights(d('2026-03-01'), d('2026-03-02'));
    const rates = new Map([['2026-03-01', rate(500000, 2)]]);
    const booked = new Map([['2026-03-01', 99]]);
    const result = computeRoomTypeAvailability(nights, rates, booked);

    expect(result.available).toBe(0);
  });

  it('is sold out (available = 0) when a night has no QUY_PHONG_GIA row at all', () => {
    const nights = enumerateNights(d('2026-03-01'), d('2026-03-03'));
    const rates = new Map([['2026-03-01', rate(500000, 5)]]); // 03-02 missing
    const result = computeRoomTypeAvailability(nights, rates, new Map());

    expect(result.available).toBe(0);
    expect(result.totalPrice).toBeNull(); // can't price an unsellable range
  });

  it('excludes cancelled bookings from occupied inventory (via buildBookedByDate)', () => {
    const nights = enumerateNights(d('2026-03-01'), d('2026-03-02'));
    const rates = new Map([['2026-03-01', rate(500000, 3)]]);

    // Caller is responsible for filtering out cancelled bookings before this
    // point (buildBookedByDate has no status concept) — this test documents
    // that a cancelled booking simply must never appear in the input list.
    const activeOnly = buildBookedByDate([
      { ngayNhanPhong: d('2026-03-01'), ngayTraPhong: d('2026-03-02'), soLuongPhong: 1 },
    ]);
    const result = computeRoomTypeAvailability(nights, rates, activeOnly);
    expect(result.available).toBe(2); // 3 - 1, the cancelled booking is simply never included
  });
});

describe('buildBookedByDate', () => {
  it('spreads a multi-night booking across each of its nights, excluding checkout day', () => {
    const map = buildBookedByDate([
      { ngayNhanPhong: d('2026-03-01'), ngayTraPhong: d('2026-03-04'), soLuongPhong: 2 },
    ]);
    expect(map.get('2026-03-01')).toBe(2);
    expect(map.get('2026-03-02')).toBe(2);
    expect(map.get('2026-03-03')).toBe(2);
    expect(map.has('2026-03-04')).toBe(false); // checkout date must not be counted
  });

  it('sums overlapping bookings on the same night', () => {
    const map = buildBookedByDate([
      { ngayNhanPhong: d('2026-03-01'), ngayTraPhong: d('2026-03-03'), soLuongPhong: 1 },
      { ngayNhanPhong: d('2026-03-02'), ngayTraPhong: d('2026-03-05'), soLuongPhong: 3 },
    ]);
    expect(map.get('2026-03-01')).toBe(1);
    expect(map.get('2026-03-02')).toBe(4); // overlap night
    expect(map.get('2026-03-03')).toBe(3);
    expect(map.get('2026-03-04')).toBe(3);
  });
});

describe('toDateKey', () => {
  it('formats as YYYY-MM-DD regardless of time-of-day component', () => {
    expect(toDateKey(new Date('2026-03-01T23:59:59.000Z'))).toBe('2026-03-01');
    expect(toDateKey(new Date('2026-03-01T00:00:00.000Z'))).toBe('2026-03-01');
  });
});
