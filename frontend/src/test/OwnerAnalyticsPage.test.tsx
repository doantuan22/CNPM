import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import OwnerAnalyticsPage from '../pages/OwnerAnalyticsPage';
import * as analyticsApi from '../features/analytics/api';
import { ApiError } from '../services/apiClient';
import type { OwnerAnalytics } from '../features/analytics/types';

vi.mock('../features/analytics/api');

beforeEach(() => {
  vi.clearAllMocks();
});

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/owner/hotels/:id/analytics" element={<OwnerAnalyticsPage />} />
    </Routes>,
    { route: '/owner/hotels/1/analytics' }
  );

const sample: OwnerAnalytics = {
  MaKhachSan: 1,
  From: null,
  To: null,
  TongSoBooking: 5,
  BookingTheoTrangThai: [
    { TrangThai: 'Đã xác nhận', SoLuong: 3 },
    { TrangThai: 'Đã hủy', SoLuong: 2 },
  ],
  DoanhThuGop: 3_000_000,
  TongHoanTien: 500_000,
  DoanhThuThucNhan: 2_500_000,
  LoaiPhongPhoBien: [{ MaLoaiPhong: 10, TenLoaiPhong: 'Standard', SoLuongDaDat: 4 }],
  TyLeLapDay: 62.5,
  TongPhongDem: 5,
  TongPhongCoTheBan: 8,
};

describe('OwnerAnalyticsPage', () => {
  it('shows a loading state', () => {
    vi.mocked(analyticsApi.getOwnerHotelAnalytics).mockReturnValueOnce(new Promise(() => undefined) as never);
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows an error state (e.g. not the owner)', async () => {
    vi.mocked(analyticsApi.getOwnerHotelAnalytics).mockRejectedValueOnce(new ApiError('Bạn không có quyền truy cập khách sạn này', 403));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(/không có quyền/i);
  });

  it('renders stat tiles, booking-status and room-type breakdowns, and occupancy', async () => {
    vi.mocked(analyticsApi.getOwnerHotelAnalytics).mockResolvedValueOnce(sample);
    renderPage();

    expect(await screen.findByText('3.000.000 đ')).toBeInTheDocument();
    expect(screen.getByText('62.5%')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Đã xác nhận')).toBeInTheDocument();
  });

  it('shows "no occupancy data" instead of a rate when TyLeLapDay is null', async () => {
    vi.mocked(analyticsApi.getOwnerHotelAnalytics).mockResolvedValueOnce({ ...sample, TyLeLapDay: null });
    renderPage();
    expect(await screen.findByText(/chưa có dữ liệu quỹ phòng/i)).toBeInTheDocument();
  });

  it('applies a date range filter and refetches', async () => {
    const user = userEvent.setup();
    vi.mocked(analyticsApi.getOwnerHotelAnalytics).mockResolvedValue(sample);
    renderPage();
    await screen.findByText('3.000.000 đ');

    await user.type(screen.getByLabelText(/từ ngày/i), '2026-01-01');
    await user.type(screen.getByLabelText(/đến ngày/i), '2026-01-31');
    await user.click(screen.getByRole('button', { name: /áp dụng/i }));

    await waitFor(() =>
      expect(analyticsApi.getOwnerHotelAnalytics).toHaveBeenCalledWith(1, { from: '2026-01-01', to: '2026-01-31' })
    );
  });
});
