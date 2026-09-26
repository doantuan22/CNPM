import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import AdminReviewsPage from '../pages/AdminReviewsPage';
import * as reviewsApi from '../features/reviews/api';
import { ApiError } from '../services/apiClient';
import type { AdminReviewListItem } from '../features/reviews/types';

vi.mock('../features/reviews/api');

beforeEach(() => {
  vi.clearAllMocks();
});

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/admin/reviews" element={<AdminReviewsPage />} />
      <Route path="/admin/reviews/:id" element={<div>Admin Review Detail Page</div>} />
    </Routes>,
    { route: '/admin/reviews' }
  );

const sampleReview: AdminReviewListItem = {
  MaDanhGia: 1,
  MaDatPhong: 10,
  MaKhachHang: 1,
  MaKhachSan: 5,
  DiemDanhGia: 4,
  NoiDung: 'Tốt',
  TrangThai: 'Chờ duyệt',
  HINH_ANH_DANH_GIA: [],
  TAI_KHOAN: { MaTaiKhoan: 1, HoTen: 'Nguyen Van A', Email: 'a@example.com' },
  KHACH_SAN: { MaKhachSan: 5, TenKhachSan: 'Grand Saigon Hotel' },
};

describe('AdminReviewsPage', () => {
  it('shows a loading state', () => {
    vi.mocked(reviewsApi.adminListReviews).mockReturnValueOnce(new Promise(() => undefined) as never);
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows an error state', async () => {
    vi.mocked(reviewsApi.adminListReviews).mockRejectedValueOnce(new ApiError('Không thể tải danh sách đánh giá', 500));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(/không thể tải danh sách đánh giá/i);
  });

  it('shows the empty state', async () => {
    vi.mocked(reviewsApi.adminListReviews).mockResolvedValueOnce({ items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } });
    renderPage();
    expect(await screen.findByText(/không tìm thấy đánh giá nào/i)).toBeInTheDocument();
  });

  it('lists reviews and links to their detail page', async () => {
    vi.mocked(reviewsApi.adminListReviews).mockResolvedValueOnce({
      items: [sampleReview],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    renderPage();

    expect(await screen.findByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('Grand Saigon Hotel')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /chi tiết/i })).toHaveAttribute('href', '/admin/reviews/1');
  });
});
