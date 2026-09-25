import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import HotelDetailPage from '../pages/HotelDetailPage';
import * as hotelsApi from '../features/hotels/api';
import { ApiError } from '../services/apiClient';
import type { HotelDetail, RoomTypeWithAvailability } from '../features/hotels/types';

vi.mock('../features/hotels/api');

beforeEach(() => {
  vi.clearAllMocks();
});

const sampleHotel: HotelDetail = {
  MaKhachSan: 1,
  TenKhachSan: 'Grand Saigon Hotel',
  DiaChiChiTiet: '123 Lê Lợi',
  MoTa: 'Một khách sạn tuyệt vời.',
  HangSao: 5,
  GioNhanPhong: '14:00',
  GioTraPhong: '12:00',
  DiaPhuong: { MaDiaPhuong: 1, TenThanhPho: 'Hồ Chí Minh', TenTinh: 'Hồ Chí Minh', QuocGia: 'Việt Nam' },
  HinhAnh: [],
  TienNghi: [{ MaTienNghi: 1, TenTienNghi: 'Wi-Fi miễn phí', BieuTuong: null }],
};

const availableRoom: RoomTypeWithAvailability = {
  MaLoaiPhong: 10,
  TenLoaiPhong: 'Standard',
  SoGiuong: 1,
  SucChua: 2,
  DienTich: 24,
  LoaiGiuong: 'Giường đôi',
  MoTa: null,
  HinhAnh: [],
  TienNghi: [],
  GiaTheoDem: 900000,
  TongTien: 1800000,
  SoDem: 2,
  SoPhongConLai: 3,
  ConHang: true,
};

const soldOutRoom: RoomTypeWithAvailability = {
  ...availableRoom,
  MaLoaiPhong: 11,
  TenLoaiPhong: 'Suite',
  SoPhongConLai: 0,
  ConHang: false,
};

const renderPage = (id = '1') =>
  renderWithProviders(
    <Routes>
      <Route path="/hotels/:id" element={<HotelDetailPage />} />
    </Routes>,
    { route: `/hotels/${id}?checkIn=2026-04-01&checkOut=2026-04-03&guests=2` }
  );

describe('HotelDetailPage', () => {
  it('shows a loading state while fetching hotel info', () => {
    vi.mocked(hotelsApi.getHotelDetail).mockReturnValueOnce(new Promise(() => undefined) as never);
    vi.mocked(hotelsApi.getHotelRooms).mockResolvedValue([]);
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders an error state when the hotel cannot be loaded', async () => {
    vi.mocked(hotelsApi.getHotelDetail).mockRejectedValueOnce(new ApiError('Không tìm thấy khách sạn', 404));
    vi.mocked(hotelsApi.getHotelRooms).mockResolvedValue([]);
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(/không tìm thấy khách sạn/i);
  });

  it('renders hotel info, amenities, and room availability once loaded', async () => {
    vi.mocked(hotelsApi.getHotelDetail).mockResolvedValueOnce(sampleHotel);
    vi.mocked(hotelsApi.getHotelRooms).mockResolvedValueOnce([availableRoom, soldOutRoom]);
    renderPage();

    expect(await screen.findByText('Grand Saigon Hotel')).toBeInTheDocument();
    expect(screen.getByText('Wi-Fi miễn phí')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText(/còn 3 phòng/i)).toBeInTheDocument();

    // Sold-out room shows the badge and its select button is disabled.
    expect(screen.getByText(/hết phòng cho khoảng ngày đã chọn/i)).toBeInTheDocument();
    const suiteButton = screen.getByRole('button', { name: /suite/i });
    expect(suiteButton).toBeDisabled();
  });

  it('renders an empty state when no room type fits the requested guest count', async () => {
    vi.mocked(hotelsApi.getHotelDetail).mockResolvedValueOnce(sampleHotel);
    vi.mocked(hotelsApi.getHotelRooms).mockResolvedValueOnce([]);
    renderPage();

    expect(await screen.findByText(/không có loại phòng phù hợp/i)).toBeInTheDocument();
  });
});
