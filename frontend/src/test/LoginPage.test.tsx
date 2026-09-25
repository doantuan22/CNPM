import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, makeFakeAccessToken } from './testUtils';
import LoginPage from '../pages/LoginPage';
import { useAuthStore } from '../lib/authStore';
import * as authApi from '../features/auth/api';
import { ApiError } from '../services/apiClient';

vi.mock('../features/auth/api');

beforeEach(() => {
  useAuthStore.setState({ accessToken: null, role: null, isBootstrapping: false });
  vi.clearAllMocks();
});

const renderLoginPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<div>Home Page</div>} />
      <Route path="/admin" element={<div>Admin Page</div>} />
    </Routes>,
    { route: '/login' }
  );

describe('LoginPage', () => {
  it('shows validation errors when submitting an empty form', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

    expect(await screen.findByText(/vui lòng nhập email hoặc tên đăng nhập/i)).toBeInTheDocument();
    expect(screen.getByText(/vui lòng nhập mật khẩu/i)).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('renders the API error message on failed login', async () => {
    vi.mocked(authApi.login).mockRejectedValueOnce(
      new ApiError('Email/tên đăng nhập hoặc mật khẩu không đúng', 401)
    );
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/email hoặc tên đăng nhập/i), 'user@example.com');
    await user.type(screen.getByLabelText(/mật khẩu/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /email\/tên đăng nhập hoặc mật khẩu không đúng/i
    );
  });

  it('shows a loading state while the login request is in flight', async () => {
    let resolveLogin: (v: Awaited<ReturnType<typeof authApi.login>>) => void = () => undefined;
    vi.mocked(authApi.login).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveLogin = resolve;
      })
    );
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/email hoặc tên đăng nhập/i), 'user@example.com');
    await user.type(screen.getByLabelText(/mật khẩu/i), 'Test@12345');
    await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

    expect(await screen.findByRole('button', { name: /đang xử lý/i })).toBeDisabled();
    resolveLogin({
      account: {
        MaTaiKhoan: 1,
        MaVaiTro: 2,
        TenDangNhap: 'user',
        Email: 'user@example.com',
        HoTen: 'Test User',
        SoDienThoai: '0900000000',
        NgaySinh: '1990-01-01',
        GioiTinh: 'Khác',
        AnhDaiDien: '',
        TrangThai: 'Hoạt động',
        NgayTao: '',
        NgayCapNhat: '',
      },
      accessToken: makeFakeAccessToken({ sub: '1', role: 'Khách hàng' }),
    });
    await screen.findByText('Home Page');
  });

  it('redirects to the customer home after a successful login', async () => {
    vi.mocked(authApi.login).mockResolvedValueOnce({
      account: {
        MaTaiKhoan: 1,
        MaVaiTro: 2,
        TenDangNhap: 'user',
        Email: 'user@example.com',
        HoTen: 'Test User',
        SoDienThoai: '0900000000',
        NgaySinh: '1990-01-01',
        GioiTinh: 'Khác',
        AnhDaiDien: '',
        TrangThai: 'Hoạt động',
        NgayTao: '',
        NgayCapNhat: '',
      },
      accessToken: makeFakeAccessToken({ sub: '1', role: 'Khách hàng' }),
    });
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/email hoặc tên đăng nhập/i), 'user@example.com');
    await user.type(screen.getByLabelText(/mật khẩu/i), 'Test@12345');
    await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

    expect(await screen.findByText('Home Page')).toBeInTheDocument();
  });

  it('redirects an admin to the admin dashboard after login', async () => {
    vi.mocked(authApi.login).mockResolvedValueOnce({
      account: {
        MaTaiKhoan: 2,
        MaVaiTro: 4,
        TenDangNhap: 'admin',
        Email: 'admin@example.com',
        HoTen: 'Admin User',
        SoDienThoai: '0900000000',
        NgaySinh: '1990-01-01',
        GioiTinh: 'Khác',
        AnhDaiDien: '',
        TrangThai: 'Hoạt động',
        NgayTao: '',
        NgayCapNhat: '',
      },
      accessToken: makeFakeAccessToken({ sub: '2', role: 'Quản trị hệ thống' }),
    });
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/email hoặc tên đăng nhập/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/mật khẩu/i), 'Test@12345');
    await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

    await waitFor(() => expect(screen.getByText('Admin Page')).toBeInTheDocument());
  });
});
