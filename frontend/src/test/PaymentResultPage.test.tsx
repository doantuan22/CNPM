import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import PaymentResultPage from '../pages/PaymentResultPage';
import * as paymentsApi from '../features/payments/api';
import type { PaymentStatusResponse } from '../features/payments/types';

vi.mock('../features/payments/api');

beforeEach(() => {
  vi.clearAllMocks();
});

const renderPage = (query: string) =>
  renderWithProviders(
    <Routes>
      <Route path="/payment/result" element={<PaymentResultPage />} />
      <Route path="/bookings/:id" element={<div>Booking Detail Page</div>} />
    </Routes>,
    { route: `/payment/result${query}` }
  );

const confirmed: PaymentStatusResponse = {
  MaDatPhong: 1,
  MaXacNhanDatPhong: 'BK111',
  TrangThaiDatPhong: 'Đã xác nhận',
  ThanhToan: [
    { MaThanhToan: 1, SoTien: 1000000, PhuongThucThanhToan: 'VNPAY', TrangThai: 'Thành công', ThoiGianGiaoDich: '2026-03-01T00:00:00.000Z', HoanTien: [] },
  ],
};

const failed: PaymentStatusResponse = {
  MaDatPhong: 1,
  MaXacNhanDatPhong: 'BK111',
  TrangThaiDatPhong: 'Chờ thanh toán',
  ThanhToan: [
    { MaThanhToan: 1, SoTien: 1000000, PhuongThucThanhToan: 'VNPAY', TrangThai: 'Thất bại', ThoiGianGiaoDich: '2026-03-01T00:00:00.000Z', HoanTien: [] },
  ],
};

describe('PaymentResultPage', () => {
  it('shows the authoritative "success" state from the backend, not just the URL hint', async () => {
    vi.mocked(paymentsApi.getPaymentStatus).mockResolvedValueOnce(confirmed);
    renderPage('?bookingId=1&status=success');
    expect(await screen.findByText(/thanh toán thành công/i)).toBeInTheDocument();
  });

  it('shows the "failed" state when the backend reports a failed payment even if the URL hint said success', async () => {
    vi.mocked(paymentsApi.getPaymentStatus).mockResolvedValueOnce(failed);
    renderPage('?bookingId=1&status=success');
    expect(await screen.findByText(/thanh toán không thành công/i)).toBeInTheDocument();
  });

  it('links to the booking detail page', async () => {
    vi.mocked(paymentsApi.getPaymentStatus).mockResolvedValueOnce(confirmed);
    renderPage('?bookingId=1&status=success');
    expect(await screen.findByRole('link', { name: /xem chi tiết đặt phòng/i })).toHaveAttribute('href', '/bookings/1');
  });
});
