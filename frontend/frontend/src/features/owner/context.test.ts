import { describe, expect, it } from 'vitest';
import { resolveOwnerHotelContext } from './context';
import type { OwnerHotel } from './types';

const hotel = (MaKhachSan: number) => ({ MaKhachSan } as OwnerHotel);

describe('resolveOwnerHotelContext', () => {
  it('does not select a hotel for an owner with no hotels', () => {
    expect(resolveOwnerHotelContext([], null)).toMatchObject({ hotelId: null, hotel: undefined, invalidHotelId: false });
  });

  it('auto-selects the single owned hotel', () => {
    expect(resolveOwnerHotelContext([hotel(12)], null)).toMatchObject({ hotelId: 12, hotel: { MaKhachSan: 12 }, invalidHotelId: false });
  });

  it('requires an in-module choice when there are multiple hotels', () => {
    expect(resolveOwnerHotelContext([hotel(12), hotel(34), hotel(56)], null)).toMatchObject({ hotelId: null, invalidHotelId: false });
  });

  it('accepts only a hotel present in the current owner list', () => {
    expect(resolveOwnerHotelContext([hotel(12), hotel(34)], '34')).toMatchObject({ hotelId: 34, hotel: { MaKhachSan: 34 }, invalidHotelId: false });
    expect(resolveOwnerHotelContext([hotel(12), hotel(34)], '99')).toMatchObject({ hotelId: null, hotel: undefined, invalidHotelId: true });
  });

  it('rejects malformed IDs', () => {
    expect(resolveOwnerHotelContext([hotel(12)], 'NaN')).toMatchObject({ hotelId: null, invalidHotelId: true });
  });
});
