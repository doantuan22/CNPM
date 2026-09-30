import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BookingDetailPage from './BookingDetailPage';
import { useBookingDetail, useCancelBooking } from '../features/bookings/hooks';
import { useCreateVnpayPayment, useRetryRefund } from '../features/payments/hooks';
import { useCreateReview, useMyReview } from '../features/reviews/hooks';
import { renderWithProviders } from '../test/testUtils';
import type { BookingDetail } from '../features/bookings/types';

vi.mock('../features/bookings/hooks');
vi.mock('../features/payments/hooks');
vi.mock('../features/reviews/hooks');

const booking = (TrangThai: string) =>
  ({
    MaDatPhong: 5,
    MaXacNhanDatPhong: 'EGD-5',
    MaKhachSan: 1,
    TenKhachSan: 'Khách sạn thử',
    NgayNhanPhong: '2030-01-01',
    NgayTraPhong: '2030-01-02',
    SoDem: 1,
    GhiChu: null,
    TrangThai,
    TongTienPhong: 1000000,
    SoTienGiam: 0,
    KhuyenMai: null,
    TongTienThanhToan: 1000000,
    ChiTietPhong: [{ MaLoaiPhong: 1, TenLoaiPhong: 'Phòng đôi', SoLuong: 1 }],
    ChinhSachHuy: { MaChinhSachHuy: 1, TenChinhSach: 'Linh hoạt', MoTa: '', ChiTiet: [{ SoGioTruocNhanPhong: 24, TyLeHoanTien: 100 }] },
    ThanhToan: [],
  }) as unknown as BookingDetail;

const idle = { mutate: vi.fn(), isPending: false, isError: false };

beforeEach(() => {
  vi.mocked(useCancelBooking).mockReturnValue(idle as unknown as ReturnType<typeof useCancelBooking>);
  vi.mocked(useCreateVnpayPayment).mockReturnValue(idle as unknown as ReturnType<typeof useCreateVnpayPayment>);
  vi.mocked(useRetryRefund).mockReturnValue(idle as unknown as ReturnType<typeof useRetryRefund>);
  vi.mocked(useCreateReview).mockReturnValue(idle as unknown as ReturnType<typeof useCreateReview>);
  vi.mocked(useMyReview).mockReturnValue({ isLoading: false, data: null } as unknown as ReturnType<typeof useMyReview>);
  Element.prototype.scrollIntoView = vi.fn();
});

const open = (status: string, hash = '') => {
  vi.mocked(useBookingDetail).mockReturnValue({ isLoading: false, isError: false, data: booking(status) } as unknown as ReturnType<typeof useBookingDetail>);
  renderWithProviders(<BookingDetailPage />, { route: `/bookings/5${hash}` });
};

describe('BookingDetailPage review anchor', () => {
  it('scrolls to the review section when opened with #danh-gia on a completed booking', () => {
    open('Hoàn tất', '#danh-gia');

    const section = document.getElementById('danh-gia');
    expect(section).not.toBeNull();
    expect(screen.getByRole('heading', { name: /Đánh giá/ })).toBeInTheDocument();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledOnce();
    expect(vi.mocked(Element.prototype.scrollIntoView).mock.contexts[0]).toBe(section);
  });

  it('does not scroll without the hash', () => {
    open('Hoàn tất');
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('does nothing (and does not fail) when the booking is not reviewable', () => {
    open('Đã xác nhận', '#danh-gia');
    expect(document.getElementById('danh-gia')).toBeNull();
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });
});
