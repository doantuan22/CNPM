import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfilePage from './ProfilePage';
import { useMe, useSignOut, useUpdateProfile } from '../features/auth/hooks';
import { useAuthStore } from '../lib/authStore';
import { ROLE_NAMES } from '../lib/roles';
import { renderWithProviders } from '../test/testUtils';

vi.mock('../features/auth/hooks');

beforeEach(() => {
  vi.mocked(useMe).mockReturnValue({
    isLoading: false, isError: false,
    data: { HoTen: 'Nguyễn A', Email: 'a@example.com', TenDangNhap: 'a', SoDienThoai: '0900000000', NgaySinh: null, GioiTinh: null },
  } as unknown as ReturnType<typeof useMe>);
  vi.mocked(useUpdateProfile).mockReturnValue({ mutate: vi.fn(), isPending: false, isSuccess: false, isError: false } as unknown as ReturnType<typeof useUpdateProfile>);
  vi.mocked(useSignOut).mockReturnValue({ signOut: vi.fn(), isPending: false });
});

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
