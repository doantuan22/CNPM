import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import HotelListPage from '../pages/HotelListPage';
import * as hotelsApi from '../features/hotels/api';
import * as amenitiesApi from '../features/amenities/api';
import { ApiError } from '../services/apiClient';
import type { HotelSearchItem } from '../features/hotels/types';

vi.mock('../features/hotels/api');
vi.mock('../features/amenities/api');

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(amenitiesApi.listAmenities).mockResolvedValue([]);
});

const sampleHotel: HotelSearchItem = {
  MaKhachSan: 1,
  TenKhachSan: 'Grand Saigon Hotel',
  DiaChiChiTiet: '123 Lê Lợi',
  HangSao: 5,
  DiaPhuong: { MaDiaPhuong: 1, TenThanhPho: 'Hồ Chí Minh', TenTinh: 'Hồ Chí Minh', QuocGia: 'Việt Nam' },
  AnhDaiDien: null,
  GiaTuDauTu: 900000,
  ConPhong: true,
};

const renderPage = (route = '/hotels?checkIn=2026-04-01&checkOut=2026-04-03') =>
  renderWithProviders(
    <Routes>
      <Route path="/hotels" element={<HotelListPage />} />
      <Route path="/hotels/:id" element={<div>Hotel Detail Page</div>} />
    </Routes>,
    { route }
  );

describe('HotelListPage', () => {
  it('shows a loading state while fetching', async () => {
    vi.mocked(hotelsApi.searchHotels).mockReturnValueOnce(new Promise(() => undefined) as never);
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders results with price and "Hết phòng" badge for sold-out hotels', async () => {
    vi.mocked(hotelsApi.searchHotels).mockResolvedValueOnce({
      items: [sampleHotel, { ...sampleHotel, MaKhachSan: 2, TenKhachSan: 'Sold Out Hotel', GiaTuDauTu: null, ConPhong: false }],
      pagination: { page: 1, limit: 12, total: 2, totalPages: 1 },
    });
    renderPage();

    expect(await screen.findByText('Grand Saigon Hotel')).toBeInTheDocument();
    expect(screen.getByText('Sold Out Hotel')).toBeInTheDocument();
    expect(screen.getByText('Hết phòng')).toBeInTheDocument();
    expect(screen.getByText(/900\.000/)).toBeInTheDocument();
  });

  it('renders an empty state when no hotels match', async () => {
    vi.mocked(hotelsApi.searchHotels).mockResolvedValueOnce({
      items: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
    });
    renderPage();

    expect(await screen.findByText(/không tìm thấy khách sạn phù hợp/i)).toBeInTheDocument();
  });

  it('renders an error state on API failure', async () => {
    vi.mocked(hotelsApi.searchHotels).mockRejectedValueOnce(new ApiError('Không thể tải danh sách khách sạn', 500));
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(/không thể tải danh sách khách sạn/i);
  });

  it('navigates to hotel detail carrying the current dates', async () => {
    vi.mocked(hotelsApi.searchHotels).mockResolvedValueOnce({
      items: [sampleHotel],
      pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
    });
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('link', { name: /xem chi tiết/i }));
    expect(await screen.findByText('Hotel Detail Page')).toBeInTheDocument();
  });

  it('re-queries when the star-rating filter is toggled', async () => {
    vi.mocked(hotelsApi.searchHotels).mockResolvedValue({
      items: [sampleHotel],
      pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
    });
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Grand Saigon Hotel');

    await user.click(screen.getByRole('button', { name: /^5/ }));

    await waitFor(() => {
      const lastCall = vi.mocked(hotelsApi.searchHotels).mock.calls.at(-1)?.[0];
      expect(lastCall?.starRating).toBe(5);
    });
  });
});
