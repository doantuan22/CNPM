import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import AdminSupportDetailPage from '../pages/AdminSupportDetailPage';
import * as supportApi from '../features/support/api';
import type { AdminSupportDetail } from '../features/support/types';

vi.mock('../features/support/api');

beforeEach(() => {
  vi.clearAllMocks();
});

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/admin/support/:id" element={<AdminSupportDetailPage />} />
    </Routes>,
    { route: '/admin/support/1' }
  );

const newRequest: AdminSupportDetail = {
  MaYeuCauHoTro: 1,
  MaTaiKhoanKhachHang: 1,
  MaTaiKhoanXuLy: null,
  MaDatPhong: null,
  LoaiYeuCau: 'Hỗ trợ',
  TieuDe: 'Đổi email',
  NoiDung: 'Muốn đổi email',
  KetQuaXuLy: null,
  TrangThai: 'Mới',
  NgayTao: '2026-03-01T00:00:00.000Z',
  NgayXuLy: null,
  TAI_KHOAN_YEU_CAU_HO_TRO_MaTaiKhoanKhachHangToTAI_KHOAN: { MaTaiKhoan: 1, HoTen: 'Nguyen Van A', Email: 'a@example.com' },
  TAI_KHOAN_YEU_CAU_HO_TRO_MaTaiKhoanXuLyToTAI_KHOAN: null,
};

describe('AdminSupportDetailPage', () => {
  it('renders detail and lets the admin claim a new request', async () => {
    const user = userEvent.setup();
    vi.mocked(supportApi.adminGetSupportRequest).mockResolvedValue(newRequest);
    vi.mocked(supportApi.adminUpdateSupportRequest).mockResolvedValueOnce({ ...newRequest, TrangThai: 'Đang xử lý' });
    renderPage();

    expect(await screen.findByText('Đổi email')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /tiếp nhận/i }));

    await waitFor(() =>
      expect(supportApi.adminUpdateSupportRequest).toHaveBeenCalledWith(1, { trangThai: 'Đang xử lý' })
    );
  });

  it('disables "resolve" until a result is entered, then submits it', async () => {
    const user = userEvent.setup();
    vi.mocked(supportApi.adminGetSupportRequest).mockResolvedValue({ ...newRequest, TrangThai: 'Đang xử lý' });
    vi.mocked(supportApi.adminUpdateSupportRequest).mockResolvedValueOnce({
      ...newRequest,
      TrangThai: 'Đã xử lý',
      KetQuaXuLy: 'Đã đổi email.',
      NgayXuLy: '2026-03-02T00:00:00.000Z',
    });
    renderPage();

    const resolveButton = await screen.findByRole('button', { name: /đánh dấu đã xử lý/i });
    expect(resolveButton).toBeDisabled();

    await user.type(screen.getByLabelText(/kết quả xử lý/i), 'Đã đổi email.');
    expect(resolveButton).toBeEnabled();
    await user.click(resolveButton);

    await waitFor(() =>
      expect(supportApi.adminUpdateSupportRequest).toHaveBeenCalledWith(1, { trangThai: 'Đã xử lý', ketQuaXuLy: 'Đã đổi email.' })
    );
  });

  it('shows the result read-only once already resolved, with no action buttons', async () => {
    vi.mocked(supportApi.adminGetSupportRequest).mockResolvedValueOnce({
      ...newRequest,
      TrangThai: 'Đã xử lý',
      KetQuaXuLy: 'Đã xử lý xong.',
      NgayXuLy: '2026-03-02T00:00:00.000Z',
    });
    renderPage();

    expect(await screen.findByText('Đã xử lý xong.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /tiếp nhận/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /đánh dấu đã xử lý/i })).not.toBeInTheDocument();
  });
});
