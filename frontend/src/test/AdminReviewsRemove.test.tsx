import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import AdminReviewsPage from '../pages/AdminReviewsPage';
import * as reviewsApi from '../features/reviews/api';

vi.mock('../features/reviews/api');
beforeEach(() => { vi.clearAllMocks(); });

describe('AdminReviewsPage UC37 action', () => {
  it('shows a remove action only for violation reviews and refreshes after confirmation', async () => {
    const review = { MaDanhGia: 1, MaDatPhong: 10, MaKhachHang: 1, MaKhachSan: 5, DiemDanhGia: 1, NoiDung: 'Violation', TrangThai: 'Vi phạm', HINH_ANH_DANH_GIA: [], TAI_KHOAN: { MaTaiKhoan: 1, HoTen: 'Customer', Email: 'customer@example.com' }, KHACH_SAN: { MaKhachSan: 5, TenKhachSan: 'Hotel' } };
    vi.mocked(reviewsApi.adminListReviews).mockResolvedValue({ items: [review], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } });
    vi.mocked(reviewsApi.removeViolationReview).mockResolvedValue({ ...review, TrangThai: 'Ẩn', DAT_PHONG: { MaDatPhong: 10, MaXacNhanDatPhong: 'BK10', NgayNhanPhong: '2026-01-01', NgayTraPhong: '2026-01-02' } });
    vi.spyOn(window, 'confirm').mockReturnValue(true); const user = userEvent.setup();
    renderWithProviders(<Routes><Route path="/admin/reviews" element={<AdminReviewsPage />} /></Routes>, { route: '/admin/reviews' });
    await user.click(await screen.findByRole('button', { name: /xóa\/gỡ/i })); await waitFor(() => expect(reviewsApi.removeViolationReview).toHaveBeenCalledWith(1)); expect(await screen.findByRole('status')).toHaveTextContent(/đã được gỡ/i);
  });
});
