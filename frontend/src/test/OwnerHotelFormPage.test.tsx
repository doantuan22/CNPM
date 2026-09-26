import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import OwnerHotelFormPage from '../pages/OwnerHotelFormPage';
import * as ownerApi from '../features/owner/api';
import * as locationsApi from '../features/locations/api';
import { ApiError } from '../services/apiClient';
import type { OwnerHotel } from '../features/owner/types';

vi.mock('../features/owner/api');
vi.mock('../features/locations/api');

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(locationsApi.listLocations).mockResolvedValue([
    { MaDiaPhuong: 1, TenThanhPho: 'Hồ Chí Minh', TenTinh: 'Hồ Chí Minh', QuocGia: 'Việt Nam' },
  ]);
});

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/owner/hotels/new" element={<OwnerHotelFormPage />} />
      <Route path="/owner/hotels/:id" element={<div>Hotel Manage Page</div>} />
    </Routes>,
    { route: '/owner/hotels/new' }
  );

describe('OwnerHotelFormPage', () => {
  it('shows validation errors when submitting an empty form', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Hồ Chí Minh');
    await user.click(screen.getByRole('button', { name: /đăng ký khách sạn/i }));

    expect(await screen.findByText(/tên khách sạn ít nhất 2 ký tự/i)).toBeInTheDocument();
    expect(ownerApi.createHotel).not.toHaveBeenCalled();
  });

  it('creates a hotel and redirects to its management page', async () => {
    const created: OwnerHotel = {
      MaKhachSan: 5,
      MaTaiKhoanSoHuu: 1,
      MaDiaPhuong: 1,
      MaTaiKhoanDuyet: null,
      TenKhachSan: 'New Hotel',
      DiaChiChiTiet: '1 Test St',
      HangSao: 3,
      MoTa: null,
      GioNhanPhong: '',
      GioTraPhong: '',
      TrangThai: 'Chờ duyệt',
      NgayDangKy: '',
      NgayDuyet: null,
      NgayCapNhat: '',
      DIA_PHUONG: { MaDiaPhuong: 1, TenThanhPho: 'Hồ Chí Minh', TenTinh: 'Hồ Chí Minh', QuocGia: 'Việt Nam' },
      HINH_ANH_KHACH_SAN: [],
    };
    vi.mocked(ownerApi.createHotel).mockResolvedValueOnce(created);
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Hồ Chí Minh');
    await user.type(screen.getByLabelText(/tên khách sạn/i), 'New Hotel');
    await user.type(screen.getByLabelText(/địa chỉ chi tiết/i), '1 Test Street');
    await user.selectOptions(screen.getByLabelText(/địa phương/i), '1');
    await user.click(screen.getByRole('button', { name: /đăng ký khách sạn/i }));

    expect(await screen.findByText('Hotel Manage Page')).toBeInTheDocument();
  });

  it('renders the API error message when creation fails', async () => {
    vi.mocked(ownerApi.createHotel).mockRejectedValueOnce(new ApiError('Tạo khách sạn thất bại', 400));
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Hồ Chí Minh');
    await user.type(screen.getByLabelText(/tên khách sạn/i), 'New Hotel');
    await user.type(screen.getByLabelText(/địa chỉ chi tiết/i), '1 Test Street');
    await user.selectOptions(screen.getByLabelText(/địa phương/i), '1');
    await user.click(screen.getByRole('button', { name: /đăng ký khách sạn/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/tạo khách sạn thất bại/i);
  });
});
