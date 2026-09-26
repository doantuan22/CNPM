import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './testUtils';
import AdminAnalyticsPage from '../pages/AdminAnalyticsPage';
import * as analyticsApi from '../features/analytics/api';
import { ApiError } from '../services/apiClient';
import type { AdminAnalytics } from '../features/analytics/types';

vi.mock('../features/analytics/api');

beforeEach(() => {
  vi.clearAllMocks();
});

const sample: AdminAnalytics = {
  From: null,
  To: null,
  TongTaiKhoan: 42,
  TaiKhoanTheoVaiTro: [{ Label: 'Khách hàng', SoLuong: 30 }, { Label: 'Chủ khách sạn', SoLuong: 10 }],
  TongKhachSan: 8,
  KhachSanTheoTrangThai: [{ Label: 'Hoạt động', SoLuong: 8 }],
  TongSoBooking: 15,
  BookingTheoTrangThai: [{ TrangThai: 'Đã xác nhận', SoLuong: 10 }],
  LoaiPhongPhoBien: [],
  TongGiaoDich: 12,
  ThanhToanTheoTrangThai: [{ Label: 'Thành công', SoLuong: 10 }],
  DoanhThuHeThong: 20_000_000,
  TongHoanTien: 1_000_000,
  DoanhThuThucNhan: 19_000_000,
  HoanTienTheoTrangThai: [{ Label: 'Thành công', SoLuong: 2 }],
  DanhGiaTheoTrangThai: [{ Label: 'Chờ duyệt', SoLuong: 3 }],
  YeuCauHoTroTheoTrangThai: [{ Label: 'Mới', SoLuong: 1 }],
};

describe('AdminAnalyticsPage', () => {
  it('shows a loading state', () => {
    vi.mocked(analyticsApi.getAdminAnalytics).mockReturnValueOnce(new Promise(() => undefined) as never);
    renderWithProviders(<AdminAnalyticsPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows an error state', async () => {
    vi.mocked(analyticsApi.getAdminAnalytics).mockRejectedValueOnce(new ApiError('Không thể tải thống kê', 500));
    renderWithProviders(<AdminAnalyticsPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/không thể tải thống kê/i);
  });

  it('renders every breakdown section', async () => {
    vi.mocked(analyticsApi.getAdminAnalytics).mockResolvedValueOnce(sample);
    renderWithProviders(<AdminAnalyticsPage />);

    expect(await screen.findByText('20.000.000 đ')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Khách hàng')).toBeInTheDocument();
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument();
  });

  it('applies a date range filter and refetches', async () => {
    const user = userEvent.setup();
    vi.mocked(analyticsApi.getAdminAnalytics).mockResolvedValue(sample);
    renderWithProviders(<AdminAnalyticsPage />);
    await screen.findByText('20.000.000 đ');

    await user.type(screen.getByLabelText(/từ ngày/i), '2026-01-01');
    await user.click(screen.getByRole('button', { name: /áp dụng/i }));

    await waitFor(() => expect(analyticsApi.getAdminAnalytics).toHaveBeenCalledWith({ from: '2026-01-01', to: undefined }));
  });
});
