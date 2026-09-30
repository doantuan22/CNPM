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
    HanThanhToan: TrangThai === 'Chờ thanh toán' ? '2030-01-01T10:15:00.000Z' : null,
    SoGiayConLai: TrangThai === 'Chờ thanh toán' ? 600 : null,
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

const open = (status: string, hash = '', state?: object) => {
  vi.mocked(useBookingDetail).mockReturnValue({ isLoading: false, isError: false, data: booking(status), dataUpdatedAt: Date.now(), refetch: vi.fn() } as unknown as ReturnType<typeof useBookingDetail>);
  renderWithProviders(<BookingDetailPage />, { route: state ? { pathname: `/bookings/5${hash}`, state } : `/bookings/5${hash}` } as never);
};

describe('BookingDetailPage dates', () => {
  it('shows check-in and check-out as dd/mm/yyyy, not raw ISO text', () => {
    open('Đã xác nhận');

    expect(screen.getByText('01/01/2030')).toBeInTheDocument();
    expect(screen.getByText('02/01/2030')).toBeInTheDocument();
    expect(screen.queryByText('2030-01-01')).not.toBeInTheDocument();
  });
});

describe('BookingDetailPage hotel section', () => {
  it('links to the hotel page instead of a map link that does nothing', () => {
    open('Đã xác nhận');

    expect(screen.getByRole('link', { name: /Xem thông tin khách sạn/ })).toHaveAttribute('href', '/hotels/1');
    expect(screen.queryByText(/Xem trên bản đồ/)).not.toBeInTheDocument();
  });

  it('does not show an empty photo placeholder (the booking API returns no photo)', () => {
    open('Đã xác nhận');
    expect(document.querySelector('.ph-image')).toBeNull();
  });
});

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

describe('BookingDetailPage payment hold', () => {
  it('shows how long the room is held while the booking waits for payment, without any "success" banner', () => {
    open('Chờ thanh toán');

    expect(screen.getByRole('timer')).toHaveTextContent('10:00');
    expect(screen.queryByText('Đặt phòng thành công!')).not.toBeInTheDocument();
  });

  it('acknowledges a just-created booking without calling it a success', () => {
    open('Chờ thanh toán', '', { justBooked: true });
    expect(screen.getByRole('heading', { name: 'Đã tạo đơn đặt phòng' })).toBeInTheDocument();
  });

  it('keeps the notice after a refresh (it depends on the booking state, not on navigation state)', () => {
    open('Chờ thanh toán');
    expect(screen.getByRole('heading', { name: 'Đơn đang chờ thanh toán' })).toBeInTheDocument();
  });

  it.each(['Đã xác nhận', 'Đã hủy', 'Hoàn tất'])('shows no hold for a %s booking', (status) => {
    open(status);
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });
});
