import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import AdminReviewDetailPage from '../pages/AdminReviewDetailPage';
import * as reviewsApi from '../features/reviews/api';
import type { AdminReviewDetail } from '../features/reviews/types';

vi.mock('../features/reviews/api');

beforeEach(() => { vi.clearAllMocks(); });

const renderPage = () => renderWithProviders(<Routes><Route path="/admin/reviews/:id" element={<AdminReviewDetailPage />} /></Routes>, { route: '/admin/reviews/1' });

const sampleDetail: AdminReviewDetail = {
  MaDanhGia: 1, MaDatPhong: 10, MaKhachHang: 1, MaKhachSan: 5, DiemDanhGia: 2, NoiDung: 'Không tốt', TrangThai: 'Chờ duyệt', HINH_ANH_DANH_GIA: [],
  TAI_KHOAN: { MaTaiKhoan: 1, HoTen: 'Nguyen Van A', Email: 'a@example.com' }, KHACH_SAN: { MaKhachSan: 5, TenKhachSan: 'Grand Saigon Hotel' }, DAT_PHONG: { MaDatPhong: 10, MaXacNhanDatPhong: 'BK999', NgayNhanPhong: '2026-01-01', NgayTraPhong: '2026-01-02' },
};

describe('AdminReviewDetailPage', () => {
  it('renders review detail with score and content', async () => {
    vi.mocked(reviewsApi.adminGetReview).mockResolvedValueOnce(sampleDetail); renderPage();
    expect(await screen.findByText('Grand Saigon Hotel')).toBeInTheDocument(); expect(screen.getByText('Không tốt')).toBeInTheDocument();
  });

  it('moderates the review when an action button is clicked', async () => {
    const user = userEvent.setup(); vi.mocked(reviewsApi.adminGetReview).mockResolvedValue(sampleDetail); vi.mocked(reviewsApi.moderateReview).mockResolvedValueOnce({ ...sampleDetail, TrangThai: 'Vi phạm' }); renderPage();
    await user.click(await screen.findByRole('button', { name: /đánh dấu vi phạm/i })); await waitFor(() => expect(reviewsApi.moderateReview).toHaveBeenCalledWith(1, 'Vi phạm'));
  });

  it('confirms then safely removes a violation review', async () => {
    const user = userEvent.setup(); const violation = { ...sampleDetail, TrangThai: 'Vi phạm' }; vi.mocked(reviewsApi.adminGetReview).mockResolvedValue(violation); vi.mocked(reviewsApi.removeViolationReview).mockResolvedValueOnce({ ...violation, TrangThai: 'Ẩn' }); vi.spyOn(window, 'confirm').mockReturnValue(true); renderPage();
    await user.click(await screen.findByRole('button', { name: /xóa\/gỡ đánh giá vi phạm/i })); await waitFor(() => expect(reviewsApi.removeViolationReview).toHaveBeenCalledWith(1)); expect(window.confirm).toHaveBeenCalled();
  });

  it('shows a loading/disabled state while removal is pending', async () => {
    let resolveRemove: (review: AdminReviewDetail) => void = () => undefined;
    const user = userEvent.setup(); const violation = { ...sampleDetail, TrangThai: 'Vi phạm' }; vi.mocked(reviewsApi.adminGetReview).mockResolvedValue(violation); vi.mocked(reviewsApi.removeViolationReview).mockReturnValueOnce(new Promise((resolve) => { resolveRemove = resolve; })); vi.spyOn(window, 'confirm').mockReturnValue(true); renderPage();
    await user.click(await screen.findByRole('button', { name: /xóa\/gỡ đánh giá vi phạm/i })); expect(await screen.findByRole('button', { name: 'Đang gỡ...' })).toBeDisabled(); resolveRemove({ ...violation, TrangThai: 'Ẩn' });
  });

  it('shows removal errors and disables a review already removed', async () => {
    const user = userEvent.setup(); const violation = { ...sampleDetail, TrangThai: 'Vi phạm' }; vi.mocked(reviewsApi.adminGetReview).mockResolvedValue(violation); vi.mocked(reviewsApi.removeViolationReview).mockRejectedValueOnce(new Error('Remove failed')); vi.spyOn(window, 'confirm').mockReturnValue(true); renderPage();
    await user.click(await screen.findByRole('button', { name: /xóa\/gỡ đánh giá vi phạm/i })); expect(await screen.findByRole('alert')).toHaveTextContent(/không thể gỡ đánh giá/i);
    vi.mocked(reviewsApi.adminGetReview).mockResolvedValueOnce({ ...sampleDetail, TrangThai: 'Ẩn' }); renderPage(); expect(await screen.findByRole('button', { name: /đã gỡ khỏi công khai/i })).toBeDisabled();
  });
});
