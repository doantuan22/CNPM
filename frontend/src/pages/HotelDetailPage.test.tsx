import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HotelDetailPage from './HotelDetailPage';
import { FeedbackProvider } from '../components/common/FeedbackProvider';
import { useHotelDetail, useHotelRooms } from '../features/hotels/hooks';
import { useCreateQuote } from '../features/quotes/hooks';
import { useCreateBooking } from '../features/bookings/hooks';
import { useLocations } from '../features/locations/hooks';
import { shareUrl } from '../lib/share';
import { renderWithProviders } from '../test/testUtils';

vi.mock('../features/hotels/hooks');
vi.mock('../features/quotes/hooks');
vi.mock('../features/bookings/hooks');
vi.mock('../features/locations/hooks');
vi.mock('../lib/share');

const image = (id: number) => ({ MaHinhAnh: id, URL: `https://img.test/${id}.jpg`, AnhDaiDien: id === 1 });
const hotel = {
  MaKhachSan: 1,
  TenKhachSan: 'Khách sạn thử',
  HangSao: 4,
  DiaChiChiTiet: '1 Đường thử',
  MoTa: 'Mô tả',
  HinhAnh: [1, 2, 3, 4, 5, 6].map(image),
  TienNghi: [],
};
const idle = { mutate: vi.fn(), reset: vi.fn(), isPending: false, isError: false, data: undefined, variables: undefined };

beforeEach(() => {
  vi.mocked(useHotelDetail).mockReturnValue({ isLoading: false, isError: false, data: hotel } as unknown as ReturnType<typeof useHotelDetail>);
  vi.mocked(useHotelRooms).mockReturnValue({ isLoading: false, isError: false, isFetching: false, data: [] } as unknown as ReturnType<typeof useHotelRooms>);
  vi.mocked(useCreateQuote).mockReturnValue(idle as unknown as ReturnType<typeof useCreateQuote>);
  vi.mocked(useCreateBooking).mockReturnValue(idle as unknown as ReturnType<typeof useCreateBooking>);
  vi.mocked(useLocations).mockReturnValue({ data: [] } as unknown as ReturnType<typeof useLocations>);
  vi.mocked(shareUrl).mockReset();
  Element.prototype.scrollIntoView = vi.fn();
});

const open = () =>
  renderWithProviders(
    <Routes>
      <Route path="/hotels/:id" element={<FeedbackProvider><HotelDetailPage /></FeedbackProvider>} />
    </Routes>,
    { route: '/hotels/1?checkIn=2030-01-01&checkOut=2030-01-02&guests=2' }
  );

describe('HotelDetailPage share button', () => {
  it('shares the page link with the hotel name and confirms when the link was copied', async () => {
    vi.mocked(shareUrl).mockResolvedValue('copied');
    open();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Chia sẻ' }));

    expect(shareUrl).toHaveBeenCalledWith({ title: 'Khách sạn thử', url: window.location.href });
    expect(await screen.findByText('Đã sao chép liên kết')).toBeInTheDocument();
  });

  it('shows no toast when the share sheet was used or dismissed', async () => {
    vi.mocked(shareUrl).mockResolvedValue('cancelled');
    open();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Chia sẻ' }));

    await waitFor(() => expect(shareUrl).toHaveBeenCalled());
    expect(screen.queryByText('Đã sao chép liên kết')).not.toBeInTheDocument();
    expect(screen.queryByText('Không thể chia sẻ')).not.toBeInTheDocument();
  });

  it('tells the user when sharing is not possible', async () => {
    vi.mocked(shareUrl).mockRejectedValue(new Error('no clipboard'));
    open();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Chia sẻ' }));

    expect(await screen.findByText('Không thể chia sẻ')).toBeInTheDocument();
  });
});

describe('HotelDetailPage without features that have no backend', () => {
  it('does not offer a "Lưu" (favourite) button', () => {
    open();
    expect(screen.queryByRole('button', { name: 'Lưu' })).not.toBeInTheDocument();
  });
});

describe('HotelDetailPage photo gallery', () => {
  it('opens the gallery from "Xem tất cả N ảnh"', async () => {
    open();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Xem tất cả 6 ảnh' }));

    expect(screen.getByRole('dialog', { name: 'Ảnh Khách sạn thử' })).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /Ảnh \d \/ 6/ })).toHaveLength(6);
  });

  it('opens the gallery when a photo is clicked', async () => {
    open();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Xem ảnh lớn 1' }));

    expect(screen.getByRole('dialog', { name: 'Ảnh Khách sạn thử' })).toBeInTheDocument();
  });
});
