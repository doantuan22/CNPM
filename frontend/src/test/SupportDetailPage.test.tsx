import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import SupportDetailPage from '../pages/SupportDetailPage';
import * as supportApi from '../features/support/api';
import { ApiError } from '../services/apiClient';
import type { SupportRequest } from '../features/support/types';

vi.mock('../features/support/api');

beforeEach(() => {
  vi.clearAllMocks();
});

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/support/:id" element={<SupportDetailPage />} />
    </Routes>,
    { route: '/support/1' }
  );

describe('SupportDetailPage', () => {
  it('shows a loading state', () => {
    vi.mocked(supportApi.getMySupportRequest).mockReturnValueOnce(new Promise(() => undefined) as never);
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows an error state (e.g. viewing someone else\'s request)', async () => {
    vi.mocked(supportApi.getMySupportRequest).mockRejectedValueOnce(new ApiError('Bạn không có quyền xem yêu cầu này', 403));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(/không có quyền/i);
  });

  it('shows the request detail without a result while unresolved', async () => {
    const request: SupportRequest = {
      MaYeuCauHoTro: 1,
      MaTaiKhoanKhachHang: 1,
      MaTaiKhoanXuLy: null,
      MaDatPhong: null,
      LoaiYeuCau: 'Khiếu nại',
      TieuDe: 'Phòng bẩn',
      NoiDung: 'Phòng không sạch khi nhận',
      KetQuaXuLy: null,
      TrangThai: 'Mới',
      NgayTao: '2026-03-01T00:00:00.000Z',
      NgayXuLy: null,
    };
    vi.mocked(supportApi.getMySupportRequest).mockResolvedValueOnce(request);
    renderPage();

    expect(await screen.findByText('Phòng bẩn')).toBeInTheDocument();
    expect(screen.getByText('Mới')).toBeInTheDocument();
    expect(screen.queryByText(/kết quả xử lý/i)).not.toBeInTheDocument();
  });

  it('shows the processing result once resolved', async () => {
    const request: SupportRequest = {
      MaYeuCauHoTro: 1,
      MaTaiKhoanKhachHang: 1,
      MaTaiKhoanXuLy: 2,
      MaDatPhong: null,
      LoaiYeuCau: 'Hỗ trợ',
      TieuDe: 'Đổi email',
      NoiDung: 'Muốn đổi email tài khoản',
      KetQuaXuLy: 'Đã cập nhật email mới cho khách.',
      TrangThai: 'Đã xử lý',
      NgayTao: '2026-03-01T00:00:00.000Z',
      NgayXuLy: '2026-03-02T00:00:00.000Z',
    };
    vi.mocked(supportApi.getMySupportRequest).mockResolvedValueOnce(request);
    renderPage();

    expect(await screen.findByText('Đã cập nhật email mới cho khách.')).toBeInTheDocument();
    expect(screen.getByText('Đã xử lý')).toBeInTheDocument();
  });
});
