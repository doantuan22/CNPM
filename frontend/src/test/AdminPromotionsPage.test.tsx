import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import AdminPromotionsPage from '../pages/AdminPromotionsPage';
import * as promotionsApi from '../features/promotions/api';
import { ApiError } from '../services/apiClient';
import type { Promotion } from '../features/promotions/types';

vi.mock('../features/promotions/api');

beforeEach(() => {
  vi.clearAllMocks();
});

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/admin/promotions" element={<AdminPromotionsPage />} />
      <Route path="/admin/promotions/new" element={<div>Promotion Form Page</div>} />
      <Route path="/admin/promotions/:id" element={<div>Promotion Detail Page</div>} />
    </Routes>,
    { route: '/admin/promotions' }
  );

const samplePromo: Promotion = {
  MaKhuyenMai: 1,
  MaCode: 'SALE10',
  LoaiGiamGia: 'Phần trăm',
  GiaTriGiam: 10,
  GiaTriDonToiThieu: 0,
  MucGiamToiDa: 0,
  SoLuongGioiHan: 0,
  NgayBatDau: '2026-01-01',
  NgayKetThuc: '2026-12-31',
  PhamViApDung: 'Toàn hệ thống',
  TrangThai: 'Hoạt động',
};

describe('AdminPromotionsPage', () => {
  it('shows a loading state', () => {
    vi.mocked(promotionsApi.listPromotions).mockReturnValueOnce(new Promise(() => undefined) as never);
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows an error state', async () => {
    vi.mocked(promotionsApi.listPromotions).mockRejectedValueOnce(new ApiError('Không thể tải danh sách khuyến mãi', 500));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(/không thể tải danh sách khuyến mãi/i);
  });

  it('shows the empty state', async () => {
    vi.mocked(promotionsApi.listPromotions).mockResolvedValueOnce({ items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } });
    renderPage();
    expect(await screen.findByText(/không tìm thấy mã khuyến mãi nào/i)).toBeInTheDocument();
  });

  it('lists promotions and links to detail/create pages', async () => {
    vi.mocked(promotionsApi.listPromotions).mockResolvedValueOnce({ items: [samplePromo], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } });
    renderPage();

    expect(await screen.findByText('SALE10')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /chi tiết/i })).toHaveAttribute('href', '/admin/promotions/1');
    expect(screen.getByRole('link', { name: /tạo mã mới/i })).toHaveAttribute('href', '/admin/promotions/new');
  });
});
