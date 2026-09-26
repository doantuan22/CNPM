import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import AdminReviewDetailPage from '../pages/AdminReviewDetailPage';
import * as reviewsApi from '../features/reviews/api';
import type { AdminReviewDetail } from '../features/reviews/types';

vi.mock('../features/reviews/api');

beforeEach(() => {
  vi.clearAllMocks();
});

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/admin/reviews/:id" element={<AdminReviewDetailPage />} />
    </Routes>,
    { route: '/admin/reviews/1' }
  );

const sampleDetail: AdminReviewDetail = {
  MaDanhGia: 1,
  MaDatPhong: 10,
  MaKhachHang: 1,
  MaKhachSan: 5,
  DiemDanhGia: 2,
  NoiDung: 'Không tốt',
  TrangThai: 'Chờ duyệt',
  HINH_ANH_DANH_GIA: [],
  TAI_KHOAN: { MaTaiKhoan: 1, HoTen: 'Nguyen Van A', Email: 'a@example.com' },
  KHACH_SAN: { MaKhachSan: 5, TenKhachSan: 'Grand Saigon Hotel' },
  DAT_PHONG: { MaDatPhong: 10, MaXacNhanDatPhong: 'BK999', NgayNhanPhong: '2026-01-01', NgayTraPhong: '2026-01-02' },
};

describe('AdminReviewDetailPage', () => {
  it('renders review detail with score and content', async () => {
    vi.mocked(reviewsApi.adminGetReview).mockResolvedValueOnce(sampleDetail);
    renderPage();
    expect(await screen.findByText('Grand Saigon Hotel')).toBeInTheDocument();
    expect(screen.getByText('Không tốt')).toBeInTheDocument();
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument();
  });

  it('moderates the review when an action button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(reviewsApi.adminGetReview).mockResolvedValue(sampleDetail);
    vi.mocked(reviewsApi.moderateReview).mockResolvedValueOnce({ ...sampleDetail, TrangThai: 'Vi phạm' });
    renderPage();

    await user.click(await screen.findByRole('button', { name: /đánh dấu vi phạm/i }));

    await waitFor(() => expect(reviewsApi.moderateReview).toHaveBeenCalledWith(1, 'Vi phạm'));
  });
});
