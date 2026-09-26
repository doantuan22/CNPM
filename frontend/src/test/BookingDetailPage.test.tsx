import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import BookingDetailPage from '../pages/BookingDetailPage';
import * as bookingsApi from '../features/bookings/api';
import * as paymentsApi from '../features/payments/api';
import * as reviewsApi from '../features/reviews/api';
import { ApiError } from '../services/apiClient';
import type { BookingDetail } from '../features/bookings/types';

vi.mock('../features/bookings/api');
vi.mock('../features/payments/api');
vi.mock('../features/reviews/api');

beforeEach(() => {
  vi.clearAllMocks();
});

const farFutureIso = (daysAhead: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d.toISOString().slice(0, 10);
};

const baseBooking: BookingDetail = {
  MaDatPhong: 1,
  MaXacNhanDatPhong: 'BK111',
  MaKhachSan: 5,
  MaTaiKhoanKhachHang: 1,
  NgayNhanPhong: farFutureIso(10),
  NgayTraPhong: farFutureIso(12),
  SoDem: 2,
  ChiTietPhong: [{ MaLoaiPhong: 10, TenLoaiPhong: 'Standard', SoLuong: 1, GiaTheoDem: null, ThanhTien: null }],
  TongTienPhong: 1000000,
  KhuyenMai: null,
  SoTienGiam: 0,
  TongTienThanhToan: 1000000,
  TrangThai: 'Chờ thanh toán',
  GhiChu: null,
  ChinhSachHuy: {
    MaChinhSachHuy: 1,
    TenChinhSach: 'Chính sách hủy tiêu chuẩn',
    MoTa: 'Hoàn tiền theo thời gian hủy.',
    ChiTiet: [
      { SoGioTruocNhanPhong: 72, TyLeHoanTien: 100 },
      { SoGioTruocNhanPhong: 24, TyLeHoanTien: 50 },
    ],
  },
  NgayTao: '2026-03-01T00:00:00.000Z',
  ThanhToan: [],
};

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/bookings/:id" element={<BookingDetailPage />} />
    </Routes>,
    { route: '/bookings/1' }
  );

describe('BookingDetailPage', () => {
  it('shows a loading state', () => {
    vi.mocked(bookingsApi.getBookingDetail).mockReturnValueOnce(new Promise(() => undefined) as never);
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows an error state', async () => {
    vi.mocked(bookingsApi.getBookingDetail).mockRejectedValueOnce(new ApiError('Không tìm thấy đặt phòng', 404));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(/không tìm thấy đặt phòng/i);
  });

  it('renders booking detail, totals and the cancellation policy tiers', async () => {
    vi.mocked(bookingsApi.getBookingDetail).mockResolvedValueOnce(baseBooking);
    renderPage();

    expect(await screen.findByText('BK111')).toBeInTheDocument();
    expect(screen.getByText('Standard × 1')).toBeInTheDocument();
    expect(screen.getByText('Chính sách hủy tiêu chuẩn')).toBeInTheDocument();
    expect(screen.getByText(/hủy trước 72 giờ: hoàn 100%/i)).toBeInTheDocument();
    expect(screen.getByText('Chờ thanh toán')).toBeInTheDocument();
  });

  describe('payment', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...originalLocation, href: '' },
      });
    });
    afterEach(() => {
      Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
    });

    it('starts a VNPAY payment and redirects to the returned paymentUrl', async () => {
      const user = userEvent.setup();
      vi.mocked(bookingsApi.getBookingDetail).mockResolvedValueOnce(baseBooking);
      vi.mocked(paymentsApi.createVnpayPayment).mockResolvedValueOnce({
        maThanhToan: 1,
        maGiaoDichDoiTac: 'PAYXYZ',
        paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=PAYXYZ',
      });
      renderPage();

      await user.click(await screen.findByRole('button', { name: /thanh toán qua vnpay/i }));

      await waitFor(() => expect(paymentsApi.createVnpayPayment).toHaveBeenCalledWith(1));
      await waitFor(() => expect(window.location.href).toBe('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=PAYXYZ'));
    });
  });

  describe('cancel + refund preview', () => {
    const confirmedWithPayment: BookingDetail = {
      ...baseBooking,
      TrangThai: 'Đã xác nhận',
      ThanhToan: [
        {
          MaThanhToan: 1,
          SoTien: 1000000,
          PhuongThucThanhToan: 'VNPAY',
          TrangThai: 'Thành công',
          ThoiGianGiaoDich: '2026-03-01T00:00:00.000Z',
          HoanTien: [],
        },
      ],
    };

    it('shows a refund preview (>=72h before check-in → 100%) before confirming cancellation', async () => {
      const user = userEvent.setup();
      vi.mocked(bookingsApi.getBookingDetail).mockResolvedValueOnce(confirmedWithPayment);
      renderPage();

      await user.click(await screen.findByRole('button', { name: /hủy đặt phòng/i }));
      expect(screen.getByText(/dự kiến hoàn/i)).toHaveTextContent('1.000.000 đ');
      expect(screen.getByText(/100% của 1\.000\.000 đ/)).toBeInTheDocument();
    });

    it('confirms cancellation and calls the cancel API', async () => {
      const user = userEvent.setup();
      vi.mocked(bookingsApi.getBookingDetail).mockResolvedValue(confirmedWithPayment);
      vi.mocked(bookingsApi.cancelBooking).mockResolvedValueOnce({ ...confirmedWithPayment, TrangThai: 'Đã hủy' });
      renderPage();

      await user.click(await screen.findByRole('button', { name: /hủy đặt phòng/i }));
      await user.click(screen.getByRole('button', { name: /xác nhận hủy/i }));

      await waitFor(() => expect(bookingsApi.cancelBooking).toHaveBeenCalledWith(1, { ghiChu: undefined }));
    });

    it('never shows a Cancel button for an already-cancelled booking', async () => {
      vi.mocked(bookingsApi.getBookingDetail).mockResolvedValueOnce({ ...baseBooking, TrangThai: 'Đã hủy' });
      renderPage();
      await screen.findByText('BK111');
      expect(screen.queryByRole('button', { name: /hủy đặt phòng/i })).not.toBeInTheDocument();
    });
  });

  describe('refund status + retry', () => {
    it('shows a "Thử lại" button for a failed refund and calls the retry API', async () => {
      const user = userEvent.setup();
      const bookingWithFailedRefund: BookingDetail = {
        ...baseBooking,
        TrangThai: 'Đã hủy',
        ThanhToan: [
          {
            MaThanhToan: 1,
            SoTien: 1000000,
            PhuongThucThanhToan: 'VNPAY',
            TrangThai: 'Thành công',
            ThoiGianGiaoDich: '2026-03-01T00:00:00.000Z',
            HoanTien: [
              {
                MaHoanTien: 9,
                SoTienHoan: 1000000,
                LyDoHoanTien: 'Hủy đặt phòng — hoàn 100%',
                TrangThai: 'Thất bại',
                NgayYeuCau: '2026-03-02T00:00:00.000Z',
                NgayHoanTien: null,
              },
            ],
          },
        ],
      };
      vi.mocked(bookingsApi.getBookingDetail).mockResolvedValue(bookingWithFailedRefund);
      vi.mocked(paymentsApi.retryRefund).mockResolvedValueOnce({
        MaHoanTien: 9,
        SoTienHoan: 1000000,
        LyDoHoanTien: 'Hủy đặt phòng — hoàn 100%',
        TrangThai: 'Thành công',
        NgayYeuCau: '2026-03-02T00:00:00.000Z',
        NgayHoanTien: '2026-03-02T00:05:00.000Z',
      });
      renderPage();

      expect(await screen.findByText('Thất bại')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /thử lại/i }));

      await waitFor(() => expect(paymentsApi.retryRefund).toHaveBeenCalledWith(9));
    });
  });

  describe('review section (M7)', () => {
    const completedBooking: BookingDetail = { ...baseBooking, TrangThai: 'Hoàn tất' };

    it('is not shown for a booking that has not completed its stay', async () => {
      vi.mocked(bookingsApi.getBookingDetail).mockResolvedValueOnce(baseBooking); // "Chờ thanh toán"
      renderPage();
      await screen.findByText('BK111');
      expect(reviewsApi.getMyReview).not.toHaveBeenCalled();
      expect(screen.queryByText('Đánh giá')).not.toBeInTheDocument();
    });

    it('shows a review form for a completed booking with no review yet, and submits it', async () => {
      const user = userEvent.setup();
      vi.mocked(bookingsApi.getBookingDetail).mockResolvedValue(completedBooking);
      vi.mocked(reviewsApi.getMyReview).mockResolvedValueOnce(null);
      vi.mocked(reviewsApi.createReview).mockResolvedValueOnce({
        MaDanhGia: 1,
        MaDatPhong: 1,
        MaKhachHang: 1,
        MaKhachSan: 5,
        DiemDanhGia: 4,
        NoiDung: 'Rất tốt',
        TrangThai: 'Chờ duyệt',
        HINH_ANH_DANH_GIA: [],
      });
      renderPage();

      await user.click(await screen.findByRole('button', { name: '4 sao' }));
      await user.type(screen.getByLabelText(/nhận xét/i), 'Rất tốt');
      await user.click(screen.getByRole('button', { name: /gửi đánh giá/i }));

      await waitFor(() =>
        expect(reviewsApi.createReview).toHaveBeenCalledWith(1, { diemDanhGia: 4, noiDung: 'Rất tốt', hinhAnh: undefined })
      );
    });

    it('shows the existing review with its moderation status instead of the form', async () => {
      vi.mocked(bookingsApi.getBookingDetail).mockResolvedValueOnce(completedBooking);
      vi.mocked(reviewsApi.getMyReview).mockResolvedValueOnce({
        MaDanhGia: 1,
        MaDatPhong: 1,
        MaKhachHang: 1,
        MaKhachSan: 5,
        DiemDanhGia: 5,
        NoiDung: 'Tuyệt vời',
        TrangThai: 'Hiển thị',
        HINH_ANH_DANH_GIA: [],
      });
      renderPage();

      expect(await screen.findByText('Tuyệt vời')).toBeInTheDocument();
      expect(screen.getByText('Hiển thị')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /gửi đánh giá/i })).not.toBeInTheDocument();
    });
  });
});
