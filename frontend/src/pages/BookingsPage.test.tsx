import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BookingsPage from './BookingsPage';
import { useMyBookings } from '../features/bookings/hooks';
import { renderWithProviders } from '../test/testUtils';
import type { BookingSummary } from '../features/bookings/types';

vi.mock('../features/bookings/hooks');

const booking = (id: number, TrangThai: string) =>
  ({
    MaDatPhong: id,
    MaXacNhanDatPhong: `EGD-${id}`,
    TenKhachSan: `Khách sạn ${id}`,
    NgayNhanPhong: '2030-01-01',
    NgayTraPhong: '2030-01-02',
    TongTienThanhToan: 1000000,
    TrangThai,
  }) as BookingSummary;

const bookings = [
  booking(1, 'Chờ thanh toán'),
  booking(2, 'Đã xác nhận'),
  booking(3, 'Hoàn tất'),
  booking(4, 'Đã hủy'),
  booking(5, 'Trạng thái lạ'),
];

beforeEach(() => {
  vi.mocked(useMyBookings).mockReturnValue({ data: bookings, isLoading: false, isError: false } as ReturnType<typeof useMyBookings>);
});

describe('BookingsPage', () => {
  it('offers the review action only for completed bookings', () => {
    renderWithProviders(<BookingsPage />);

    const reviewLinks = screen.getAllByRole('link', { name: 'Đánh giá' });
    expect(reviewLinks).toHaveLength(1);
    expect(reviewLinks[0]).toHaveAttribute('href', '/bookings/3#danh-gia');
  });

  it('filters by the exact backend status', async () => {
    renderWithProviders(<BookingsPage />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Đã xác nhận' }));

    expect(screen.getByText('Khách sạn 2')).toBeInTheDocument();
    expect(screen.queryByText('Khách sạn 3')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Đánh giá' })).not.toBeInTheDocument();
  });

  it('keeps a booking with an unknown status visible under "Tất cả" with its original label, and under no status tab', async () => {
    renderWithProviders(<BookingsPage />);
    const user = userEvent.setup();

    const all = screen.getByText('Khách sạn 5').closest('.card') as HTMLElement;
    expect(within(all).getByText('Trạng thái lạ')).toBeInTheDocument();

    for (const tab of ['Chờ thanh toán', 'Đã xác nhận', 'Hoàn tất', 'Đã hủy']) {
      await user.click(screen.getByRole('button', { name: tab }));
      expect(screen.queryByText('Khách sạn 5')).not.toBeInTheDocument();
    }
  });
});
