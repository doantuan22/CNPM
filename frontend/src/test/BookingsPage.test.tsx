import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import BookingsPage from '../pages/BookingsPage';
import * as bookingsApi from '../features/bookings/api';
import { ApiError } from '../services/apiClient';
import type { BookingSummary } from '../features/bookings/types';

vi.mock('../features/bookings/api');

beforeEach(() => {
  vi.clearAllMocks();
});

const sampleList: BookingSummary[] = [
  {
    MaDatPhong: 1,
    MaXacNhanDatPhong: 'BK111',
    TenKhachSan: 'Grand Saigon Hotel',
    NgayNhanPhong: '2026-04-01',
    NgayTraPhong: '2026-04-03',
    TongTienThanhToan: 1800000,
    TrangThai: 'Đã xác nhận',
    NgayTao: '2026-03-01T00:00:00.000Z',
  },
];

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/bookings" element={<BookingsPage />} />
      <Route path="/bookings/:id" element={<div>Booking Detail Page</div>} />
    </Routes>,
    { route: '/bookings' }
  );

describe('BookingsPage', () => {
  it('shows a loading state', () => {
    vi.mocked(bookingsApi.listMyBookings).mockReturnValueOnce(new Promise(() => undefined) as never);
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows an error state', async () => {
    vi.mocked(bookingsApi.listMyBookings).mockRejectedValueOnce(new ApiError('Không thể tải danh sách', 500));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(/không thể tải danh sách/i);
  });

  it('shows the empty state when there are no bookings', async () => {
    vi.mocked(bookingsApi.listMyBookings).mockResolvedValueOnce([]);
    renderPage();
    expect(await screen.findByText(/chưa có thông tin đặt phòng/i)).toBeInTheDocument();
  });

  it('lists bookings with status and links to the detail page', async () => {
    vi.mocked(bookingsApi.listMyBookings).mockResolvedValueOnce(sampleList);
    renderPage();

    expect(await screen.findByText('Grand Saigon Hotel')).toBeInTheDocument();
    expect(screen.getByText('Đã xác nhận')).toBeInTheDocument();
    expect(screen.getByText('BK111')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /grand saigon hotel/i })).toHaveAttribute('href', '/bookings/1');
  });
});
