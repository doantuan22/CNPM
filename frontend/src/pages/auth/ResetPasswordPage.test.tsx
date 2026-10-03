import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ResetPasswordPage from './ResetPasswordPage';
import { useResetPassword, useSignOut } from '../../features/auth/hooks';
import { useAuthStore } from '../../lib/authStore';
import { renderWithProviders } from '../../test/testUtils';

vi.mock('../../features/auth/hooks');

const mutateAsync = vi.fn();
const signOut = vi.fn();

beforeEach(() => {
  mutateAsync.mockReset().mockResolvedValue(undefined);
  signOut.mockReset().mockResolvedValue(undefined);
  vi.mocked(useResetPassword).mockReturnValue({ mutateAsync, isPending: false, isError: false } as unknown as ReturnType<typeof useResetPassword>);
  vi.mocked(useSignOut).mockReturnValue({ signOut, isPending: false });
});

const renderPage = (route = '/reset-password?token=abc.def.ghi', signedIn = false) => {
  useAuthStore.setState({ accessToken: signedIn ? 'access.jwt' : null, role: null, isBootstrapping: false });
  renderWithProviders(
    <Routes>
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/login" element={<div>LOGIN PAGE</div>} />
    </Routes>,
    { route },
  );
};

const submitNewPassword = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Mật khẩu mới'), 'NewPassword@1');
  await user.type(screen.getByLabelText('Xác nhận mật khẩu mới'), 'NewPassword@1');
  await user.click(screen.getByRole('button', { name: 'Cập nhật mật khẩu' }));
};

describe('ResetPasswordPage — forgot-password context (signed out)', () => {
  it('keeps the original wording and back link', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Đặt mật khẩu mới' })).toBeInTheDocument();
    expect(screen.getByText('1. Nhập email')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Quay lại Đăng nhập/ })).toHaveAttribute('href', '/login');
  });

  it('sends the token and new password, does not sign out, and goes to /login', async () => {
    renderPage();

    await submitNewPassword();

    await waitFor(() => expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument());
    expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ token: 'abc.def.ghi', MatKhauMoi: 'NewPassword@1' }));
    expect(signOut).not.toHaveBeenCalled();
  });

  it('still explains a missing token and points to forgot-password', () => {
    renderPage('/reset-password');

    expect(screen.getByRole('heading', { name: 'Liên kết không hợp lệ' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Quên mật khẩu' })).toHaveAttribute('href', '/forgot-password');
  });
});

describe('ResetPasswordPage — change-password context (signed in, from the profile)', () => {
  it('uses change-password wording and links back to the profile', () => {
    renderPage(undefined, true);

    expect(screen.getByRole('heading', { name: 'Đổi mật khẩu' })).toBeInTheDocument();
    expect(screen.getByText('1. Yêu cầu đổi mật khẩu')).toBeInTheDocument();
    expect(screen.queryByText('1. Nhập email')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Quay lại hồ sơ/ })).toHaveAttribute('href', '/profile');
  });

  it('signs this session out locally after the change, then goes to /login', async () => {
    renderPage(undefined, true);

    await submitNewPassword();

    await waitFor(() => expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument());
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(mutateAsync.mock.invocationCallOrder[0]).toBeLessThan(signOut.mock.invocationCallOrder[0]);
  });

  it('stays on the page and does not sign out when the link is rejected', async () => {
    mutateAsync.mockRejectedValue(new Error('invalid'));
    renderPage(undefined, true);

    await submitNewPassword();

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(signOut).not.toHaveBeenCalled();
    expect(screen.queryByText('LOGIN PAGE')).not.toBeInTheDocument();
  });

  it('sends a signed-in user without a token back to the profile, not to the guest-only forgot page', () => {
    renderPage('/reset-password', true);

    expect(screen.getByRole('link', { name: 'Quay lại hồ sơ' })).toHaveAttribute('href', '/profile');
    expect(screen.queryByRole('link', { name: 'Quên mật khẩu' })).not.toBeInTheDocument();
  });
});
