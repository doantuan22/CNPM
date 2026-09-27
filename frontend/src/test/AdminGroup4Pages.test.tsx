import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import { ApiError } from '../services/apiClient';
import AdminCreateAccountPage from '../pages/AdminCreateAccountPage';
import AdminHotelsPage from '../pages/AdminHotelsPage';
import AdminHotelDetailPage from '../pages/AdminHotelDetailPage';
import AdminPaymentsPage from '../pages/AdminPaymentsPage';
import AdminPaymentDetailPage from '../pages/AdminPaymentDetailPage';
import * as accountsApi from '../features/admin/accounts/api';
import * as hotelsApi from '../features/admin/hotels/api';
import * as paymentsApi from '../features/admin/payments/api';

vi.mock('../features/admin/accounts/api'); vi.mock('../features/admin/hotels/api'); vi.mock('../features/admin/payments/api');
const pagination = { page: 1, limit: 20, total: 1, totalPages: 1 };
const hotel = { MaKhachSan: 10, TenKhachSan: 'Hotel One', DiaChiChiTiet: '1 Test Street', HangSao: 4, MoTa: 'Nice', TrangThai: 'Hoạt động', MaDiaPhuong: 1, DIA_PHUONG: { TenThanhPho: 'Hà Nội' } };
const payment = { MaThanhToan: 20, SoTien: 500000, TrangThai: 'Thành công', PhuongThucThanhToan: 'VNPAY', ThoiGianGiaoDich: '2026-01-01', DAT_PHONG: { MaXacNhanDatPhong: 'BOOK-20', TAI_KHOAN: { MaTaiKhoan: 3, HoTen: 'Nguyễn A' }, KHACH_SAN: { MaKhachSan: 10, TenKhachSan: 'Hotel One' } }, HOAN_TIEN: [{ MaHoanTien: 1, SoTienHoan: 100000, TrangThai: 'Thành công' }] };

beforeEach(() => { vi.clearAllMocks(); });

describe('Group 4 admin pages', () => {
  it('creates an account then navigates to the list (UC28)', async () => {
    vi.mocked(accountsApi.createAccount).mockResolvedValueOnce({} as never); const user = userEvent.setup();
    renderWithProviders(<Routes><Route path="/admin/accounts/new" element={<AdminCreateAccountPage />} /><Route path="/admin/accounts" element={<p>Account list</p>} /></Routes>, { route: '/admin/accounts/new' });
    for (const [label, value] of [['Tên đăng nhập', 'newuser'], ['Email', 'new@example.com'], ['Họ tên', 'New User'], ['Số điện thoại', '0900000000'], ['Mật khẩu ban đầu', 'Test@12345']] as const) await user.type(screen.getByLabelText(label), value);
    await user.selectOptions(screen.getByLabelText('Vai trò'), '1'); await user.click(screen.getByRole('button', { name: 'Tạo tài khoản' }));
    await screen.findByText('Account list'); expect(accountsApi.createAccount).toHaveBeenCalled();
  });

  it('shows account-create API errors', async () => {
    vi.mocked(accountsApi.createAccount).mockRejectedValueOnce(new ApiError('Email đã tồn tại', 409)); const user = userEvent.setup();
    renderWithProviders(<Routes><Route path="/admin/accounts/new" element={<AdminCreateAccountPage />} /></Routes>, { route: '/admin/accounts/new' });
    for (const [label, value] of [['Tên đăng nhập', 'newuser'], ['Email', 'new@example.com'], ['Họ tên', 'New User'], ['Số điện thoại', '0900000000'], ['Mật khẩu ban đầu', 'Test@12345']] as const) await user.type(screen.getByLabelText(label), value);
    await user.selectOptions(screen.getByLabelText('Vai trò'), '1'); await user.click(screen.getByRole('button', { name: 'Tạo tài khoản' })); expect(await screen.findByRole('alert')).toHaveTextContent('Email đã tồn tại');
  });

  it('renders hotel loading, empty and success states (UC33)', async () => {
    let resolveHotels: (value: Awaited<ReturnType<typeof hotelsApi.listAdminHotels>>) => void = () => undefined;
    vi.mocked(hotelsApi.listAdminHotels).mockReturnValueOnce(new Promise((resolve) => { resolveHotels = resolve; })); renderWithProviders(<AdminHotelsPage />); expect(screen.getByRole('status')).toHaveTextContent('Đang tải'); resolveHotels({ items: [], pagination }); await screen.findByText('Chưa có khách sạn phù hợp.');
    vi.mocked(hotelsApi.listAdminHotels).mockResolvedValueOnce({ items: [], pagination }); renderWithProviders(<AdminHotelsPage />); expect(await screen.findByText('Chưa có khách sạn phù hợp.')).toBeInTheDocument();
    vi.mocked(hotelsApi.listAdminHotels).mockResolvedValueOnce({ items: [hotel], pagination }); renderWithProviders(<AdminHotelsPage />); expect(await screen.findByText('Hotel One')).toBeInTheDocument();
  });

  it('shows hotel list errors and supports suspend/reactivate in detail (UC34)', async () => {
    vi.mocked(hotelsApi.listAdminHotels).mockRejectedValueOnce(new ApiError('Không thể tải', 500)); renderWithProviders(<AdminHotelsPage />); expect(await screen.findByRole('alert')).toHaveTextContent('Không thể tải');
    vi.mocked(hotelsApi.getAdminHotel).mockResolvedValueOnce(hotel).mockResolvedValueOnce({ ...hotel, TrangThai: 'Đình chỉ' }).mockResolvedValueOnce(hotel); vi.mocked(hotelsApi.suspendAdminHotel).mockResolvedValueOnce({ ...hotel, TrangThai: 'Đình chỉ' }); vi.mocked(hotelsApi.reactivateAdminHotel).mockResolvedValueOnce(hotel); vi.spyOn(window, 'confirm').mockReturnValue(true); const user = userEvent.setup();
    renderWithProviders(<Routes><Route path="/admin/hotels/:id" element={<AdminHotelDetailPage />} /></Routes>, { route: '/admin/hotels/10' }); await user.click(await screen.findByRole('button', { name: 'Đình chỉ' })); await waitFor(() => expect(hotelsApi.suspendAdminHotel).toHaveBeenCalledWith(10)); await user.click(await screen.findByRole('button', { name: 'Kích hoạt lại' })); await waitFor(() => expect(hotelsApi.reactivateAdminHotel).toHaveBeenCalledWith(10));
  });

  it('edits hotel data and renders hotel-detail errors (UC33)', async () => {
    vi.mocked(hotelsApi.getAdminHotel).mockResolvedValueOnce(hotel).mockResolvedValueOnce({ ...hotel, TenKhachSan: 'Hotel Edited' }); vi.mocked(hotelsApi.updateAdminHotel).mockResolvedValueOnce({ ...hotel, TenKhachSan: 'Hotel Edited' }); const user = userEvent.setup();
    renderWithProviders(<Routes><Route path="/admin/hotels/:id" element={<AdminHotelDetailPage />} /></Routes>, { route: '/admin/hotels/10' }); const name = await screen.findByLabelText('Tên khách sạn'); await user.clear(name); await user.type(name, 'Hotel Edited'); await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' })); await waitFor(() => expect(hotelsApi.updateAdminHotel).toHaveBeenCalledWith(10, expect.objectContaining({ TenKhachSan: 'Hotel Edited' })));
    vi.mocked(hotelsApi.getAdminHotel).mockRejectedValueOnce(new ApiError('Không tìm thấy khách sạn', 404)); renderWithProviders(<Routes><Route path="/admin/hotels/:id" element={<AdminHotelDetailPage />} /></Routes>, { route: '/admin/hotels/11' }); expect(await screen.findByRole('alert')).toHaveTextContent('Không tìm thấy khách sạn');
  });

  it('renders payment loading, empty, success and error states (UC35)', async () => {
    vi.mocked(paymentsApi.listAdminPayments).mockResolvedValueOnce({ items: [], pagination }); renderWithProviders(<AdminPaymentsPage />); expect(await screen.findByText('Chưa có giao dịch phù hợp.')).toBeInTheDocument();
    vi.mocked(paymentsApi.listAdminPayments).mockResolvedValueOnce({ items: [payment], pagination }); renderWithProviders(<AdminPaymentsPage />); expect(await screen.findByText('BOOK-20')).toBeInTheDocument();
    vi.mocked(paymentsApi.listAdminPayments).mockRejectedValueOnce(new ApiError('Không thể tải', 500)); renderWithProviders(<AdminPaymentsPage />); expect(await screen.findByRole('alert')).toHaveTextContent('Không thể tải');
  });

  it('renders read-only payment detail and its error state (UC35)', async () => {
    vi.mocked(paymentsApi.getAdminPayment).mockResolvedValueOnce(payment); renderWithProviders(<Routes><Route path="/admin/payments/:id" element={<AdminPaymentDetailPage />} /></Routes>, { route: '/admin/payments/20' }); expect(await screen.findByText('BOOK-20')).toBeInTheDocument(); expect(screen.queryByRole('button', { name: /lưu|cập nhật/i })).not.toBeInTheDocument();
    vi.mocked(paymentsApi.getAdminPayment).mockRejectedValueOnce(new ApiError('Không tìm thấy', 404)); renderWithProviders(<Routes><Route path="/admin/payments/:id" element={<AdminPaymentDetailPage />} /></Routes>, { route: '/admin/payments/21' }); expect(await screen.findByRole('alert')).toHaveTextContent('Không tìm thấy');
  });
});
