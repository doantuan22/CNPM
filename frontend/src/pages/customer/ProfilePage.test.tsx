import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfilePage from './ProfilePage';
import { useForgotPassword, useMe, useSignOut, useUpdateProfile } from '../../features/auth/hooks';
import { ApiError } from '../../services/apiClient';
import { useAuthStore } from '../../lib/authStore';
import { ROLE_NAMES } from '../../lib/roles';
import { renderWithProviders } from '../../test/testUtils';

vi.mock('../../features/auth/hooks');

beforeEach(() => {
  vi.mocked(useMe).mockReturnValue({
    isLoading: false, isError: false,
    data: { HoTen: 'Nguyễn A', Email: 'tuan@example.com', TenDangNhap: 'a', SoDienThoai: '0900000000', NgaySinh: null, GioiTinh: null },
  } as unknown as ReturnType<typeof useMe>);
  vi.mocked(useUpdateProfile).mockReturnValue({ mutate: vi.fn(), isPending: false, isSuccess: false, isError: false } as unknown as ReturnType<typeof useUpdateProfile>);
  vi.mocked(useSignOut).mockReturnValue({ signOut: vi.fn(), isPending: false });
  mockForgotPassword();
});

const mockForgotPassword = (state: Record<string, unknown> = {}) => {
  const mutate = vi.fn();
  vi.mocked(useForgotPassword).mockReturnValue({ mutate, isPending: false, isSuccess: false, isError: false, ...state } as unknown as ReturnType<typeof useForgotPassword>);
  return mutate;
};

const renderAs = (role: string) => {
  useAuthStore.setState({ accessToken: 'token', role, isBootstrapping: false });
  renderWithProviders(<ProfilePage />);
};

describe('ProfilePage account menu', () => {
  it('gives a customer the customer navigation (bookings, support) and a sign-out button', () => {
    renderAs(ROLE_NAMES.CUSTOMER);

    expect(screen.getByRole('link', { name: 'Đặt phòng của tôi' })).toHaveAttribute('href', '/bookings');
    expect(screen.getByRole('link', { name: 'Hỗ trợ/Khiếu nại' })).toHaveAttribute('href', '/support');
    expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeInTheDocument();
  });

  it.each([ROLE_NAMES.ADMIN, ROLE_NAMES.PARTNER])('shows %s only the profile, inside their dashboard, without customer-only links', (role) => {
    renderAs(role);

    expect(screen.getByRole('heading', { name: 'Hồ sơ cá nhân' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Đặt phòng của tôi' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Hỗ trợ/Khiếu nại' })).not.toBeInTheDocument();
  });
});

describe('ProfilePage change password (email link)', () => {
  it('is a button that does not navigate to /reset-password', () => {
    renderAs(ROLE_NAMES.CUSTOMER);

    expect(screen.getByRole('button', { name: 'Đổi mật khẩu' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Đổi mật khẩu' })).not.toBeInTheDocument();
    expect(document.querySelector('a[href="/reset-password"]')).toBeNull();
  });

  it('requests the reset link for the signed-in account email', async () => {
    const mutate = mockForgotPassword();
    renderAs(ROLE_NAMES.CUSTOMER);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Đổi mật khẩu' }));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith({ Email: 'tuan@example.com' });
  });

  it('shows where the link went, with the email masked', () => {
    mockForgotPassword({ isSuccess: true });
    renderAs(ROLE_NAMES.CUSTOMER);

    expect(screen.getByRole('status')).toHaveTextContent('Đã gửi link tới t***@example.com');
    expect(screen.getByRole('status')).not.toHaveTextContent('tuan@example.com');
    expect(screen.getByRole('button', { name: 'Gửi lại link' })).toBeInTheDocument();
  });

  it('does not send again while a request is in flight', async () => {
    const mutate = mockForgotPassword({ isPending: true });
    renderAs(ROLE_NAMES.CUSTOMER);

    const button = screen.getByRole('button', { name: 'Đổi mật khẩu' });
    expect(button).toBeDisabled();
    await userEvent.setup().click(button);

    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows the server message when the request is refused (e.g. rate limited)', () => {
    mockForgotPassword({ isError: true, error: new ApiError('Quá nhiều yêu cầu. Vui lòng thử lại sau.', 429) });
    renderAs(ROLE_NAMES.CUSTOMER);

    expect(screen.getByRole('alert')).toHaveTextContent('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
  });
});
