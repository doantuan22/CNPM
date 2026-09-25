import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import RegisterPage from '../pages/RegisterPage';
import { useAuthStore } from '../lib/authStore';
import * as authApi from '../features/auth/api';

vi.mock('../features/auth/api');

beforeEach(() => {
  useAuthStore.setState({ accessToken: null, role: null, isBootstrapping: false });
  vi.clearAllMocks();
});

const renderRegisterPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<div>Home Page</div>} />
      <Route path="/partner/apply" element={<div>Partner Apply Page</div>} />
    </Routes>,
    { route: '/register' }
  );

describe('RegisterPage', () => {
  it('shows validation errors when submitting an empty form', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.click(screen.getByRole('button', { name: /đăng ký$/i }));

    expect(await screen.findByText(/họ và tên ít nhất 2 ký tự/i)).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('rejects a mismatched password confirmation', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText(/^họ và tên$/i), 'Nguyen Van A');
    await user.type(screen.getByLabelText(/^tên đăng nhập$/i), 'nguyenvana');
    await user.type(screen.getByLabelText(/^email$/i), 'a@example.com');
    await user.type(screen.getByLabelText(/số điện thoại/i), '0912345678');
    await user.type(screen.getByLabelText(/ngày sinh/i), '2000-01-01');
    await user.selectOptions(screen.getByLabelText(/giới tính/i), 'Nam');
    await user.type(screen.getByLabelText(/^mật khẩu$/i), 'Password123');
    await user.type(screen.getByLabelText(/xác nhận mật khẩu/i), 'Different123');
    await user.click(screen.getByRole('button', { name: /đăng ký$/i }));

    expect(await screen.findByText(/mật khẩu xác nhận không khớp/i)).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('switches copy and post-register redirect when "Đăng ký đối tác" is selected', async () => {
    vi.mocked(authApi.register).mockResolvedValueOnce({
      account: {
        MaTaiKhoan: 1,
        MaVaiTro: 2,
        TenDangNhap: 'nguyenvana',
        Email: 'a@example.com',
        HoTen: 'Nguyen Van A',
        SoDienThoai: '0912345678',
        NgaySinh: '2000-01-01',
        GioiTinh: 'Nam',
        AnhDaiDien: '',
        TrangThai: 'Hoạt động',
        NgayTao: '',
        NgayCapNhat: '',
      },
      accessToken: 'header.eyJzdWIiOiIxIiwicm9sZSI6Iktow6FjaCBow6BuZyJ9.sig',
    });
    const user = userEvent.setup();
    renderRegisterPage();

    await user.click(screen.getByRole('tab', { name: /đăng ký đối tác/i }));
    expect(screen.getByRole('button', { name: /đăng ký đối tác/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^họ và tên$/i), 'Nguyen Van A');
    await user.type(screen.getByLabelText(/^tên đăng nhập$/i), 'nguyenvana');
    await user.type(screen.getByLabelText(/^email$/i), 'a@example.com');
    await user.type(screen.getByLabelText(/số điện thoại/i), '0912345678');
    await user.type(screen.getByLabelText(/ngày sinh/i), '2000-01-01');
    await user.selectOptions(screen.getByLabelText(/giới tính/i), 'Nam');
    await user.type(screen.getByLabelText(/^mật khẩu$/i), 'Password123');
    await user.type(screen.getByLabelText(/xác nhận mật khẩu/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /đăng ký đối tác/i }));

    expect(await screen.findByText('Partner Apply Page')).toBeInTheDocument();
  });

  it('DDI-01 (resolved): submits successfully without filling in Ngày sinh / Giới tính', async () => {
    vi.mocked(authApi.register).mockResolvedValueOnce({
      account: {
        MaTaiKhoan: 1,
        MaVaiTro: 2,
        TenDangNhap: 'nguyenvanb',
        Email: 'b@example.com',
        HoTen: 'Nguyen Van B',
        SoDienThoai: '0912345679',
        NgaySinh: null,
        GioiTinh: null,
        AnhDaiDien: null,
        TrangThai: 'Hoạt động',
        NgayTao: '',
        NgayCapNhat: '',
      },
      accessToken: 'header.eyJzdWIiOiIxIiwicm9sZSI6Iktow6FjaCBow6BuZyJ9.sig',
    });
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText(/^họ và tên$/i), 'Nguyen Van B');
    await user.type(screen.getByLabelText(/^tên đăng nhập$/i), 'nguyenvanb');
    await user.type(screen.getByLabelText(/^email$/i), 'b@example.com');
    await user.type(screen.getByLabelText(/số điện thoại/i), '0912345679');
    // Ngày sinh / Giới tính intentionally left untouched.
    await user.type(screen.getByLabelText(/^mật khẩu$/i), 'Password123');
    await user.type(screen.getByLabelText(/xác nhận mật khẩu/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /đăng ký$/i }));

    await screen.findByText('Home Page');
    expect(authApi.register).toHaveBeenCalledWith(
      expect.objectContaining({ NgaySinh: undefined, GioiTinh: undefined })
    );
  });
});
