import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, makeFakeAccessToken } from './testUtils';
import HotelDetailPage from '../pages/HotelDetailPage';
import * as hotelsApi from '../features/hotels/api';
import * as quotesApi from '../features/quotes/api';
import * as bookingsApi from '../features/bookings/api';
import { useAuthStore } from '../lib/authStore';
import { ROLE_NAMES } from '../lib/roles';
import { ApiError } from '../services/apiClient';
import type { HotelDetail, RoomTypeWithAvailability } from '../features/hotels/types';
import type { Quote } from '../features/quotes/types';
import type { Booking } from '../features/bookings/types';

vi.mock('../features/hotels/api');
vi.mock('../features/quotes/api');
vi.mock('../features/bookings/api');

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ accessToken: null, role: null, isBootstrapping: false });
});

const sampleHotel: HotelDetail = {
  MaKhachSan: 1,
  TenKhachSan: 'Grand Saigon Hotel',
  DiaChiChiTiet: '123 Lê Lợi',
  MoTa: 'Một khách sạn tuyệt vời.',
  HangSao: 5,
  GioNhanPhong: '14:00',
  GioTraPhong: '12:00',
  DiaPhuong: { MaDiaPhuong: 1, TenThanhPho: 'Hồ Chí Minh', TenTinh: 'Hồ Chí Minh', QuocGia: 'Việt Nam' },
  HinhAnh: [],
  TienNghi: [{ MaTienNghi: 1, TenTienNghi: 'Wi-Fi miễn phí', BieuTuong: null }],
};

const availableRoom: RoomTypeWithAvailability = {
  MaLoaiPhong: 10,
  TenLoaiPhong: 'Standard',
  SoGiuong: 1,
  SucChua: 2,
  DienTich: 24,
  LoaiGiuong: 'Giường đôi',
  MoTa: null,
  HinhAnh: [],
  TienNghi: [],
  GiaTheoDem: 900000,
  TongTien: 1800000,
  SoDem: 2,
  SoPhongConLai: 3,
  ConHang: true,
};

const soldOutRoom: RoomTypeWithAvailability = {
  ...availableRoom,
  MaLoaiPhong: 11,
  TenLoaiPhong: 'Suite',
  SoPhongConLai: 0,
  ConHang: false,
};

const sampleQuote: Quote = {
  MaKhachSan: 1,
  NgayNhanPhong: '2026-04-01',
  NgayTraPhong: '2026-04-03',
  SoDem: 2,
  ChiTietPhong: [
    {
      MaLoaiPhong: 10,
      TenLoaiPhong: 'Standard',
      SoLuongYeuCau: 1,
      SoPhongConLai: 3,
      DuPhong: true,
      CoGiaDayDu: true,
      GiaTheoDem: 900000,
      ThanhTien: 1800000,
    },
  ],
  KhaDung: true,
  TongTienPhong: 1800000,
  KhuyenMai: null,
  SoTienGiam: 0,
  TongTienThanhToan: 1800000,
  PromoHopLe: false,
  PromoThongBao: null,
  ChinhSachHuy: {
    MaChinhSachHuy: 1,
    TenChinhSach: 'Chính sách hủy tiêu chuẩn',
    MoTa: 'Hoàn tiền theo thời gian hủy trước ngày nhận phòng.',
    ChiTiet: [{ SoGioTruocNhanPhong: 48, TyLeHoanTien: 100 }],
  },
};

const renderPage = (id = '1') =>
  renderWithProviders(
    <Routes>
      <Route path="/hotels/:id" element={<HotelDetailPage />} />
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/bookings" element={<div>Bookings Result Page</div>} />
    </Routes>,
    { route: `/hotels/${id}?checkIn=2026-04-01&checkOut=2026-04-03&guests=2` }
  );

const sampleBooking: Booking = {
  MaDatPhong: 42,
  MaXacNhanDatPhong: 'BK123ABC',
  MaKhachSan: 1,
  NgayNhanPhong: '2026-04-01',
  NgayTraPhong: '2026-04-03',
  SoDem: 2,
  ChiTietPhong: [
    { MaLoaiPhong: 10, TenLoaiPhong: 'Standard', SoLuong: 1, GiaTheoDem: 900000, ThanhTien: 1800000 },
  ],
  TongTienPhong: 1800000,
  KhuyenMai: null,
  SoTienGiam: 0,
  TongTienThanhToan: 1800000,
  TrangThai: 'Chờ thanh toán',
  GhiChu: null,
  ChinhSachHuy: sampleQuote.ChinhSachHuy!,
  NgayTao: '2026-03-01T00:00:00.000Z',
};

describe('HotelDetailPage', () => {
  it('shows a loading state while fetching hotel info', () => {
    vi.mocked(hotelsApi.getHotelDetail).mockReturnValueOnce(new Promise(() => undefined) as never);
    vi.mocked(hotelsApi.getHotelRooms).mockResolvedValue([]);
    renderPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders an error state when the hotel cannot be loaded', async () => {
    vi.mocked(hotelsApi.getHotelDetail).mockRejectedValueOnce(new ApiError('Không tìm thấy khách sạn', 404));
    vi.mocked(hotelsApi.getHotelRooms).mockResolvedValue([]);
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(/không tìm thấy khách sạn/i);
  });

  it('renders hotel info, amenities, and room availability once loaded', async () => {
    vi.mocked(hotelsApi.getHotelDetail).mockResolvedValueOnce(sampleHotel);
    vi.mocked(hotelsApi.getHotelRooms).mockResolvedValueOnce([availableRoom, soldOutRoom]);
    renderPage();

    expect(await screen.findByText('Grand Saigon Hotel')).toBeInTheDocument();
    expect(screen.getByText('Wi-Fi miễn phí')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText(/còn 3 phòng/i)).toBeInTheDocument();

    // Sold-out room shows the badge and its select button is disabled.
    expect(screen.getByText(/hết phòng cho khoảng ngày đã chọn/i)).toBeInTheDocument();
    const suiteButton = screen.getByRole('button', { name: /suite/i });
    expect(suiteButton).toBeDisabled();
  });

  it('renders an empty state when no room type fits the requested guest count', async () => {
    vi.mocked(hotelsApi.getHotelDetail).mockResolvedValueOnce(sampleHotel);
    vi.mocked(hotelsApi.getHotelRooms).mockResolvedValueOnce([]);
    renderPage();

    expect(await screen.findByText(/không có loại phòng phù hợp/i)).toBeInTheDocument();
  });

  it('requests a quote when a room is selected and shows the total payment and cancellation policy', async () => {
    const user = userEvent.setup();
    vi.mocked(hotelsApi.getHotelDetail).mockResolvedValueOnce(sampleHotel);
    vi.mocked(hotelsApi.getHotelRooms).mockResolvedValueOnce([availableRoom, soldOutRoom]);
    vi.mocked(quotesApi.createQuote).mockResolvedValueOnce(sampleQuote);
    renderPage();

    const standardButton = await screen.findByRole('button', { name: /standard/i });
    await user.click(standardButton);

    await waitFor(() => {
      expect(quotesApi.createQuote).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          checkIn: '2026-04-01',
          checkOut: '2026-04-03',
          rooms: [{ maLoaiPhong: 10, soLuong: 1 }],
          promoCode: undefined,
        })
      );
    });

    await screen.findByText('Tổng thanh toán');
    expect(screen.getAllByText('1.800.000 đ')).toHaveLength(2); // Tổng tiền phòng + Tổng thanh toán (no discount)
    expect(screen.getByText('Chính sách hủy tiêu chuẩn')).toBeInTheDocument();
    expect(screen.getByText(/hủy trước 48 giờ: hoàn 100%/i)).toBeInTheDocument();
  });

  it('applies a promo code and shows the discount, or the invalid-promo message on failure', async () => {
    const user = userEvent.setup();
    vi.mocked(hotelsApi.getHotelDetail).mockResolvedValueOnce(sampleHotel);
    vi.mocked(hotelsApi.getHotelRooms).mockResolvedValueOnce([availableRoom]);
    vi.mocked(quotesApi.createQuote).mockResolvedValueOnce(sampleQuote);
    renderPage();

    await user.click(await screen.findByRole('button', { name: /standard/i }));
    await screen.findByText('Tổng thanh toán');

    vi.mocked(quotesApi.createQuote).mockResolvedValueOnce({
      ...sampleQuote,
      KhuyenMai: { MaKhuyenMai: 1, MaCode: 'SALE10', LoaiGiamGia: 'Phần trăm', GiaTriGiam: 10 },
      SoTienGiam: 180000,
      TongTienThanhToan: 1620000,
      PromoHopLe: true,
      PromoThongBao: 'Áp dụng mã khuyến mãi thành công',
    });

    await user.type(screen.getByLabelText(/mã khuyến mãi/i), 'SALE10');
    await user.click(screen.getByRole('button', { name: /áp dụng/i }));

    expect(await screen.findByText('Áp dụng mã khuyến mãi thành công')).toBeInTheDocument();
    expect(screen.getByText(/giảm giá \(sale10\)/i)).toBeInTheDocument();
    expect(screen.getByText('1.620.000 đ')).toBeInTheDocument();

    vi.mocked(quotesApi.createQuote).mockResolvedValueOnce({
      ...sampleQuote,
      PromoHopLe: false,
      PromoThongBao: 'Mã khuyến mãi không tồn tại',
    });
    await user.clear(screen.getByLabelText(/mã khuyến mãi/i));
    await user.type(screen.getByLabelText(/mã khuyến mãi/i), 'BADCODE');
    await user.click(screen.getByRole('button', { name: /áp dụng/i }));

    expect(await screen.findByText('Mã khuyến mãi không tồn tại')).toBeInTheDocument();
  });

  it('shows a sold-out warning when the quote reports unavailable inventory', async () => {
    const user = userEvent.setup();
    vi.mocked(hotelsApi.getHotelDetail).mockResolvedValueOnce(sampleHotel);
    vi.mocked(hotelsApi.getHotelRooms).mockResolvedValueOnce([availableRoom]);
    vi.mocked(quotesApi.createQuote).mockResolvedValueOnce({
      ...sampleQuote,
      KhaDung: false,
      ChiTietPhong: [{ ...sampleQuote.ChiTietPhong[0], DuPhong: false, SoPhongConLai: 0 }],
    });
    renderPage();

    await user.click(await screen.findByRole('button', { name: /standard/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/chỉ còn 0 phòng/i);
  });

  it('shows an error message when the quote request fails', async () => {
    const user = userEvent.setup();
    vi.mocked(hotelsApi.getHotelDetail).mockResolvedValueOnce(sampleHotel);
    vi.mocked(hotelsApi.getHotelRooms).mockResolvedValueOnce([availableRoom]);
    vi.mocked(quotesApi.createQuote).mockRejectedValueOnce(new ApiError('Không thể tạo báo giá', 500));
    renderPage();

    await user.click(await screen.findByRole('button', { name: /standard/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/không thể tạo báo giá/i);
  });

  it('prompts an unauthenticated visitor to log in instead of offering to confirm the booking', async () => {
    const user = userEvent.setup();
    vi.mocked(hotelsApi.getHotelDetail).mockResolvedValueOnce(sampleHotel);
    vi.mocked(hotelsApi.getHotelRooms).mockResolvedValueOnce([availableRoom]);
    vi.mocked(quotesApi.createQuote).mockResolvedValueOnce(sampleQuote);
    renderPage();

    await user.click(await screen.findByRole('button', { name: /standard/i }));
    await screen.findByText('Tổng thanh toán');

    expect(screen.getByRole('button', { name: /đăng nhập để đặt phòng/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^xác nhận đặt phòng$/i })).not.toBeInTheDocument();
  });

  it('lets a logged-in customer confirm the booking and navigates to the result page', async () => {
    useAuthStore.setState({
      accessToken: makeFakeAccessToken({ sub: '1', role: ROLE_NAMES.CUSTOMER }),
      role: ROLE_NAMES.CUSTOMER,
      isBootstrapping: false,
    });
    const user = userEvent.setup();
    vi.mocked(hotelsApi.getHotelDetail).mockResolvedValueOnce(sampleHotel);
    vi.mocked(hotelsApi.getHotelRooms).mockResolvedValueOnce([availableRoom]);
    vi.mocked(quotesApi.createQuote).mockResolvedValueOnce(sampleQuote);
    vi.mocked(bookingsApi.createBooking).mockResolvedValueOnce(sampleBooking);
    renderPage();

    await user.click(await screen.findByRole('button', { name: /standard/i }));
    await screen.findByText('Tổng thanh toán');

    await user.click(screen.getByRole('button', { name: /^xác nhận đặt phòng$/i }));

    await waitFor(() => {
      expect(bookingsApi.createBooking).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          checkIn: '2026-04-01',
          checkOut: '2026-04-03',
          rooms: [{ maLoaiPhong: 10, soLuong: 1 }],
        })
      );
    });
    expect(await screen.findByText('Bookings Result Page')).toBeInTheDocument();
  });

  it('shows a conflict error with a retry option when the room sells out right before confirming', async () => {
    useAuthStore.setState({
      accessToken: makeFakeAccessToken({ sub: '1', role: ROLE_NAMES.CUSTOMER }),
      role: ROLE_NAMES.CUSTOMER,
      isBootstrapping: false,
    });
    const user = userEvent.setup();
    vi.mocked(hotelsApi.getHotelDetail).mockResolvedValueOnce(sampleHotel);
    vi.mocked(hotelsApi.getHotelRooms).mockResolvedValueOnce([availableRoom]);
    vi.mocked(quotesApi.createQuote).mockResolvedValue(sampleQuote);
    vi.mocked(bookingsApi.createBooking).mockRejectedValueOnce(new ApiError('Không còn đủ phòng', 409));
    renderPage();

    await user.click(await screen.findByRole('button', { name: /standard/i }));
    await screen.findByText('Tổng thanh toán');

    await user.click(screen.getByRole('button', { name: /^xác nhận đặt phòng$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/không còn đủ phòng/i);
    expect(screen.getByRole('button', { name: /làm mới báo giá/i })).toBeInTheDocument();
  });
});
