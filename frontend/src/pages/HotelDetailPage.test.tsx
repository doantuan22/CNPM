import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HotelDetailPage from './HotelDetailPage';
import { FeedbackProvider } from '../components/common/FeedbackProvider';
import { useHotelDetail, useHotelRooms } from '../features/hotels/hooks';
import { useQuote } from '../features/quotes/hooks';
import { useCreateBooking } from '../features/bookings/hooks';
import { useLocations } from '../features/locations/hooks';
import { shareUrl } from '../lib/share';
import { useAuthStore } from '../lib/authStore';
import { ApiError } from '../services/apiClient';
import { formatCurrencyVND } from '../lib/utils';
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
const quoteIdle = { data: undefined, isLoading: false, isFetching: false, isError: false, error: null };
const mockQuote = (patch: object) => vi.mocked(useQuote).mockReturnValue({ ...quoteIdle, ...patch } as unknown as ReturnType<typeof useQuote>);

beforeEach(() => {
  vi.mocked(useHotelDetail).mockReturnValue({ isLoading: false, isError: false, data: hotel } as unknown as ReturnType<typeof useHotelDetail>);
  vi.mocked(useHotelRooms).mockReturnValue({ isLoading: false, isError: false, isFetching: false, data: [] } as unknown as ReturnType<typeof useHotelRooms>);
  vi.mocked(useQuote).mockReset();
  mockQuote({});
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

describe('HotelDetailPage stay summary', () => {
  it('shows the stay dates as dd/mm/yyyy', () => {
    open();
    expect(screen.getByText('01/01/2030 → 02/01/2030 · 2 khách')).toBeInTheDocument();
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

describe('HotelDetailPage mobile summary bar', () => {
  const room = {
    MaLoaiPhong: 11, TenLoaiPhong: 'Phòng Superior', SoGiuong: 1, SucChua: 2, DienTich: 24, LoaiGiuong: 'Giường đôi', MoTa: null,
    HinhAnh: [], TienNghi: [], GiaTheoDem: 700000, TongTien: 700000, SoDem: 1, SoPhongConLai: 5, ConHang: true,
  };
  const quote = {
    MaKhachSan: 1, NgayNhanPhong: '2030-01-01', NgayTraPhong: '2030-01-02', SoDem: 1, KhaDung: true,
    ChiTietPhong: [{ MaLoaiPhong: 11, TenLoaiPhong: 'Phòng Superior', SoLuongYeuCau: 1, SoPhongConLai: 5, DuPhong: true, CoGiaDayDu: true, GiaTheoDem: 700000, ThanhTien: 700000 }],
    TongTienPhong: 700000, KhuyenMai: null, SoTienGiam: 0, TongTienThanhToan: 700000, PromoHopLe: false, PromoThongBao: null, ChinhSachHuy: null,
  };
  const bar = () => screen.queryByRole('region', { name: 'Tóm tắt lựa chọn phòng' });

  beforeEach(() => {
    vi.mocked(useHotelRooms).mockReturnValue({ isLoading: false, isError: false, isFetching: false, data: [room] } as unknown as ReturnType<typeof useHotelRooms>);
  });

  it('is not shown until a room is selected', () => {
    open();
    expect(bar()).not.toBeInTheDocument();
  });

  it('shows the room count and the quoted total once a room is selected, so the price is visible without scrolling', async () => {
    mockQuote({ data: quote });
    open();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Tăng phòng Phòng Superior' }));

    expect(bar()).toHaveTextContent('1 phòng');
    expect(bar()).toHaveTextContent(formatCurrencyVND(700000));
  });

  it('says the quote is updating while there is no matching quote yet', async () => {
    open();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Tăng phòng Phòng Superior' }));

    expect(bar()).toHaveTextContent('Đang cập nhật báo giá');
  });

  it('scrolls to the booking panel from the bar', async () => {
    open();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Tăng phòng Phòng Superior' }));

    await user.click(screen.getByRole('button', { name: 'Xem chi tiết & đặt phòng' }));

    const target = vi.mocked(Element.prototype.scrollIntoView).mock.contexts.at(-1) as HTMLElement;
    expect(target.id).toBe('dat-phong');
  });
});

describe('HotelDetailPage price quote', () => {
  const room = {
    MaLoaiPhong: 11, TenLoaiPhong: 'Phòng Superior', SoGiuong: 1, SucChua: 2, DienTich: 24, LoaiGiuong: 'Giường đôi', MoTa: null,
    HinhAnh: [], TienNghi: [], GiaTheoDem: 700000, TongTien: 700000, SoDem: 1, SoPhongConLai: 5, ConHang: true,
  };
  const line = { MaLoaiPhong: 11, TenLoaiPhong: 'Phòng Superior', SoLuongYeuCau: 1, SoPhongConLai: 5, DuPhong: true, CoGiaDayDu: true, GiaTheoDem: 700000, ThanhTien: 700000 };
  const quote = {
    MaKhachSan: 1, NgayNhanPhong: '2030-01-01', NgayTraPhong: '2030-01-02', SoDem: 1, KhaDung: true, ChiTietPhong: [line],
    TongTienPhong: 700000, KhuyenMai: null, SoTienGiam: 0, TongTienThanhToan: 700000, PromoHopLe: false, PromoThongBao: null, ChinhSachHuy: null,
  };
  const request = (extra: object = {}) => ({ checkIn: '2030-01-01', checkOut: '2030-01-02', rooms: [{ maLoaiPhong: 11, soLuong: 1 }], ...extra });
  const lastRequest = () => vi.mocked(useQuote).mock.calls.at(-1)?.[1];
  const addRoom = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: 'Tăng phòng Phòng Superior' }));
  const promoInput = () => screen.getByPlaceholderText('Nhập mã (nếu có)');

  beforeEach(() => {
    vi.mocked(useHotelRooms).mockReturnValue({ isLoading: false, isError: false, isFetching: false, data: [room] } as unknown as ReturnType<typeof useHotelRooms>);
    mockQuote({ data: quote });
    useAuthStore.setState({ accessToken: 'token', role: 'Khách hàng' });
  });

  it('asks for no quote until a room is chosen', () => {
    open();
    expect(lastRequest()).toBeNull();
  });

  it('quotes the chosen rooms for the stay dates', async () => {
    open();
    await addRoom(userEvent.setup());

    expect(vi.mocked(useQuote).mock.calls.at(-1)).toEqual([1, request()]);
  });

  it('does not send a promo code that is only typed; "Áp dụng" sends it', async () => {
    open();
    const user = userEvent.setup();
    await addRoom(user);

    await user.type(promoInput(), 'SALE10');
    expect(lastRequest()).toEqual(request());
    expect(screen.getByText('Áp dụng mã để cập nhật báo giá trước khi tiếp tục.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Áp dụng' }));
    expect(lastRequest()).toEqual(request({ promoCode: 'SALE10' }));
    expect(screen.queryByText('Áp dụng mã để cập nhật báo giá trước khi tiếp tục.')).not.toBeInTheDocument();
  });

  it('drops the promo code from the quote as soon as the box is emptied', async () => {
    open();
    const user = userEvent.setup();
    await addRoom(user);
    await user.type(promoInput(), 'SALE10');
    await user.click(screen.getByRole('button', { name: 'Áp dụng' }));

    await user.clear(promoInput());

    expect(lastRequest()).toEqual(request());
  });

  it('re-quotes with the promo code that is typed when the room count changes', async () => {
    open();
    const user = userEvent.setup();
    await addRoom(user);
    await user.type(promoInput(), 'SALE10');

    await addRoom(user);

    expect(lastRequest()).toEqual(request({ rooms: [{ maLoaiPhong: 11, soLuong: 2 }], promoCode: 'SALE10' }));
  });

  it('shows a spinner while the quote loads and the error when it fails', async () => {
    mockQuote({ data: undefined, isLoading: true });
    const { unmount } = open();
    await addRoom(userEvent.setup());
    expect(document.getElementById('dat-phong')?.querySelector('.spinner')).not.toBeNull();
    unmount();

    mockQuote({ data: undefined, isError: true, error: new ApiError('Hết phòng', 409) });
    open();
    await addRoom(userEvent.setup());
    expect(screen.getAllByText('Hết phòng').length).toBeGreaterThan(0);
  });

  it('books with the promo code only when the quote says it is valid', async () => {
    const bookingMutate = vi.fn();
    vi.mocked(useCreateBooking).mockReturnValue({ ...idle, mutate: bookingMutate } as unknown as ReturnType<typeof useCreateBooking>);
    mockQuote({ data: { ...quote, PromoHopLe: true, SoTienGiam: 70000, TongTienThanhToan: 630000, PromoThongBao: 'Áp dụng thành công' } });
    open();
    const user = userEvent.setup();
    await addRoom(user);
    await user.type(promoInput(), 'SALE10');
    await user.click(screen.getByRole('button', { name: 'Áp dụng' }));

    await user.click(screen.getByRole('button', { name: /Tạo đặt phòng/ }));

    expect(bookingMutate.mock.calls[0][0]).toEqual({ ...request({ promoCode: 'SALE10' }), ghiChu: undefined });
  });

  it('books without a promo code when the quote says it is not valid', async () => {
    const bookingMutate = vi.fn();
    vi.mocked(useCreateBooking).mockReturnValue({ ...idle, mutate: bookingMutate } as unknown as ReturnType<typeof useCreateBooking>);
    mockQuote({ data: { ...quote, PromoHopLe: false, PromoThongBao: 'Mã không hợp lệ' } });
    open();
    const user = userEvent.setup();
    await addRoom(user);
    await user.type(promoInput(), 'WRONG');
    await user.click(screen.getByRole('button', { name: 'Áp dụng' }));

    await user.click(screen.getByRole('button', { name: /Tạo đặt phòng/ }));

    expect(bookingMutate.mock.calls[0][0]).toEqual({ ...request(), promoCode: undefined, ghiChu: undefined });
  });
});
