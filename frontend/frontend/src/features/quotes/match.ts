import type { Quote, QuoteRequest } from './types';

/**
 * Whether a quote was made for exactly these dates and rooms. A quote that is still on screen from the
 * previous selection must not be shown as the price (or booked) for the current one.
 */
export function quoteMatchesRequest(quote: Quote | undefined, request: Pick<QuoteRequest, 'checkIn' | 'checkOut' | 'rooms'>): boolean {
  if (!quote || quote.NgayNhanPhong !== request.checkIn || quote.NgayTraPhong !== request.checkOut) return false;
  if (quote.ChiTietPhong.length !== request.rooms.length) return false;
  return request.rooms.every((line) =>
    quote.ChiTietPhong.some((quotedLine) => quotedLine.MaLoaiPhong === line.maLoaiPhong && quotedLine.SoLuongYeuCau === line.soLuong)
  );
}
