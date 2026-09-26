import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import SupportPage from '../pages/SupportPage';
import * as supportApi from '../features/support/api';
import * as bookingsApi from '../features/bookings/api';
import { ApiError } from '../services/apiClient';
import type { SupportRequest } from '../features/support/types';

vi.mock('../features/support/api');
vi.mock('../features/bookings/api');

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(bookingsApi.listMyBookings).mockResolvedValue([]);
});

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/support" element={<SupportPage />} />
      <Route path="/support/:id" element={<div>Support Detail Page</div>} />
    </Routes>,
    { route: '/support' }
  );

const sampleRequest: SupportRequest = {
  MaYeuCauHoTro: 1,
  MaTaiKhoanKhachHang: 1,
  MaTaiKhoanXuLy: null,
  MaDatPhong: null,
  LoaiYeuCau: 'Hỗ trợ',
  TieuDe: 'Cần hỗ trợ',
  NoiDung: 'Nội dung',
  KetQuaXuLy: null,
  TrangThai: 'Mới',
  NgayTao: '2026-03-01T00:00:00.000Z',
  NgayXuLy: null,
};

describe('SupportPage', () => {
  it('shows a loading state', () => {
    vi.mocked(supportApi.listMySupportRequests).mockReturnValueOnce(new Promise(() => undefined) as never);
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows an error state', async () => {
    vi.mocked(supportApi.listMySupportRequests).mockRejectedValueOnce(new ApiError('Không thể tải danh sách', 500));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(/không thể tải danh sách/i);
  });

  it('shows the empty state', async () => {
    vi.mocked(supportApi.listMySupportRequests).mockResolvedValueOnce([]);
    renderPage();
    expect(await screen.findByText(/chưa có yêu cầu nào/i)).toBeInTheDocument();
  });

  it('lists requests and links to their detail page', async () => {
    vi.mocked(supportApi.listMySupportRequests).mockResolvedValueOnce([sampleRequest]);
    renderPage();
    expect(await screen.findByText('Cần hỗ trợ')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cần hỗ trợ/i })).toHaveAttribute('href', '/support/1');
  });

  it('creates a new request via the form', async () => {
    const user = userEvent.setup();
    vi.mocked(supportApi.listMySupportRequests).mockResolvedValue([]);
    vi.mocked(supportApi.createSupportRequest).mockResolvedValueOnce(sampleRequest);
    renderPage();

    await user.click(await screen.findByRole('button', { name: /tạo yêu cầu/i }));
    await user.type(screen.getByLabelText(/tiêu đề/i), 'Cần hỗ trợ');
    await user.type(screen.getByLabelText(/nội dung/i), 'Chi tiết yêu cầu');
    await user.click(screen.getByRole('button', { name: /gửi yêu cầu/i }));

    await waitFor(() =>
      expect(supportApi.createSupportRequest).toHaveBeenCalledWith({
        loaiYeuCau: 'Hỗ trợ',
        tieuDe: 'Cần hỗ trợ',
        noiDung: 'Chi tiết yêu cầu',
        maDatPhong: undefined,
      })
    );
  });

  it('shows an error message when creation fails', async () => {
    const user = userEvent.setup();
    vi.mocked(supportApi.listMySupportRequests).mockResolvedValue([]);
    vi.mocked(supportApi.createSupportRequest).mockRejectedValueOnce(new ApiError('Cần nhập tiêu đề', 400));
    renderPage();

    await user.click(await screen.findByRole('button', { name: /tạo yêu cầu/i }));
    await user.type(screen.getByLabelText(/tiêu đề/i), 'x');
    await user.type(screen.getByLabelText(/nội dung/i), 'y');
    await user.click(screen.getByRole('button', { name: /gửi yêu cầu/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/cần nhập tiêu đề/i);
  });
});
