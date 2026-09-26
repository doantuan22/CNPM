import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import OwnerDashboardPage from '../pages/OwnerDashboardPage';
import * as ownerApi from '../features/owner/api';
import { ApiError } from '../services/apiClient';
import type { OwnerHotel } from '../features/owner/types';

vi.mock('../features/owner/api');

beforeEach(() => {
  vi.clearAllMocks();
});

const sampleHotel: OwnerHotel = {
  MaKhachSan: 1,
  MaTaiKhoanSoHuu: 10,
  MaDiaPhuong: 1,
  MaTaiKhoanDuyet: null,
  TenKhachSan: 'My Hotel',
  DiaChiChiTiet: '1 Test St',
  HangSao: 4,
  MoTa: null,
  GioNhanPhong: '1970-01-01T14:00:00.000Z',
  GioTraPhong: '1970-01-01T12:00:00.000Z',
  TrangThai: 'Chờ duyệt',
  NgayDangKy: '',
  NgayDuyet: null,
  NgayCapNhat: '',
  DIA_PHUONG: { MaDiaPhuong: 1, TenThanhPho: 'Hồ Chí Minh', TenTinh: 'Hồ Chí Minh', QuocGia: 'Việt Nam' },
  HINH_ANH_KHACH_SAN: [],
};

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/owner" element={<OwnerDashboardPage />} />
      <Route path="/owner/hotels/new" element={<div>New Hotel Form</div>} />
      <Route path="/owner/hotels/:id" element={<div>Hotel Manage Page</div>} />
    </Routes>,
    { route: '/owner' }
  );

describe('OwnerDashboardPage', () => {
  it('shows a loading state while fetching', () => {
    vi.mocked(ownerApi.listMyHotels).mockReturnValueOnce(new Promise(() => undefined) as never);
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows an empty state with a call-to-action when there are no hotels', async () => {
    vi.mocked(ownerApi.listMyHotels).mockResolvedValueOnce([]);
    renderPage();
    expect(await screen.findByText(/bạn chưa có khách sạn nào/i)).toBeInTheDocument();
  });

  it('renders an error state on failure', async () => {
    vi.mocked(ownerApi.listMyHotels).mockRejectedValueOnce(new ApiError('Không thể tải danh sách khách sạn', 500));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(/không thể tải danh sách khách sạn/i);
  });

  it('lists owned hotels with their status', async () => {
    vi.mocked(ownerApi.listMyHotels).mockResolvedValueOnce([sampleHotel]);
    renderPage();
    expect(await screen.findByText('My Hotel')).toBeInTheDocument();
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument();
  });
});
