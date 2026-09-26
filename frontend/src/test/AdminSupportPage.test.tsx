import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import AdminSupportPage from '../pages/AdminSupportPage';
import * as supportApi from '../features/support/api';
import { ApiError } from '../services/apiClient';
import type { AdminSupportListItem } from '../features/support/types';

vi.mock('../features/support/api');

beforeEach(() => {
  vi.clearAllMocks();
});

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/admin/support" element={<AdminSupportPage />} />
      <Route path="/admin/support/:id" element={<div>Admin Support Detail Page</div>} />
    </Routes>,
    { route: '/admin/support' }
  );

const sampleRequest: AdminSupportListItem = {
  MaYeuCauHoTro: 1,
  MaTaiKhoanKhachHang: 1,
  MaTaiKhoanXuLy: null,
  MaDatPhong: null,
  LoaiYeuCau: 'Khiếu nại',
  TieuDe: 'Phòng bẩn',
  NoiDung: 'noi dung',
  KetQuaXuLy: null,
  TrangThai: 'Mới',
  NgayTao: '2026-03-01T00:00:00.000Z',
  NgayXuLy: null,
  TAI_KHOAN_YEU_CAU_HO_TRO_MaTaiKhoanKhachHangToTAI_KHOAN: { MaTaiKhoan: 1, HoTen: 'Nguyen Van A', Email: 'a@example.com' },
};

describe('AdminSupportPage', () => {
  it('shows a loading state', () => {
    vi.mocked(supportApi.adminListSupportRequests).mockReturnValueOnce(new Promise(() => undefined) as never);
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows an error state', async () => {
    vi.mocked(supportApi.adminListSupportRequests).mockRejectedValueOnce(new ApiError('Không thể tải danh sách yêu cầu', 500));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(/không thể tải danh sách yêu cầu/i);
  });

  it('shows the empty state', async () => {
    vi.mocked(supportApi.adminListSupportRequests).mockResolvedValueOnce({ items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } });
    renderPage();
    expect(await screen.findByText(/không tìm thấy yêu cầu nào/i)).toBeInTheDocument();
  });

  it('lists requests and links to their detail page', async () => {
    vi.mocked(supportApi.adminListSupportRequests).mockResolvedValueOnce({
      items: [sampleRequest],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    renderPage();

    expect(await screen.findByText('Phòng bẩn')).toBeInTheDocument();
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /chi tiết/i })).toHaveAttribute('href', '/admin/support/1');
  });
});
