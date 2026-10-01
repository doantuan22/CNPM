import { describe, expect, it } from 'vitest';
import { quoteMatchesRequest } from './match';
import type { Quote } from './types';

const quote = {
  NgayNhanPhong: '2099-05-01',
  NgayTraPhong: '2099-05-03',
  ChiTietPhong: [{ MaLoaiPhong: 1, SoLuongYeuCau: 2 }, { MaLoaiPhong: 2, SoLuongYeuCau: 1 }],
} as unknown as Quote;

const request = { checkIn: '2099-05-01', checkOut: '2099-05-03', rooms: [{ maLoaiPhong: 2, soLuong: 1 }, { maLoaiPhong: 1, soLuong: 2 }] };

describe('quoteMatchesRequest', () => {
  it('matches the same dates and rooms in any order', () => {
    expect(quoteMatchesRequest(quote, request)).toBe(true);
  });

  it('does not match without a quote', () => {
    expect(quoteMatchesRequest(undefined, request)).toBe(false);
  });

  it('does not match other dates', () => {
    expect(quoteMatchesRequest(quote, { ...request, checkOut: '2099-05-04' })).toBe(false);
    expect(quoteMatchesRequest(quote, { ...request, checkIn: '2099-04-30' })).toBe(false);
  });

  it('does not match another room count or another number of room types', () => {
    expect(quoteMatchesRequest(quote, { ...request, rooms: [{ maLoaiPhong: 1, soLuong: 3 }, { maLoaiPhong: 2, soLuong: 1 }] })).toBe(false);
    expect(quoteMatchesRequest(quote, { ...request, rooms: [{ maLoaiPhong: 1, soLuong: 2 }] })).toBe(false);
  });
});
