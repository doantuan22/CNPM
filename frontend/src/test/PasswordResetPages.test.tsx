import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import * as authApi from '../features/auth/api';
import { ApiError } from '../services/apiClient';

vi.mock('../features/auth/api');

beforeEach(() => vi.clearAllMocks());

describe('ForgotPasswordPage', () => {
  it('submits an email and only shows the generic success message', async () => {
    vi.mocked(authApi.forgotPassword).mockResolvedValueOnce();
    const user = userEvent.setup();
    renderWithProviders(
      <Routes><Route path="/forgot-password" element={<ForgotPasswordPage />} /></Routes>,
      { route: '/forgot-password' }
    );

    await user.type(screen.getByLabelText(/^email$/i), 'customer@example.com');
    await user.click(screen.getByRole('button', { name: /gửi yêu cầu/i }));

    expect(await screen.findByRole('status')).toHaveTextContent(/nếu email tồn tại/i);
    expect(authApi.forgotPassword).toHaveBeenCalledWith({ Email: 'customer@example.com' });
  });
});

describe('ResetPasswordPage', () => {
  const renderResetPage = (route: string) => renderWithProviders(
    <Routes>
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/login" element={<div>Login Page</div>} />
    </Routes>,
    { route }
  );

  it('explains when the token is missing', () => {
    renderResetPage('/reset-password');
    expect(screen.getByText(/thiếu token đặt lại mật khẩu/i)).toBeInTheDocument();
  });

  it('validates password confirmation before submitting', async () => {
    const user = userEvent.setup();
    renderResetPage('/reset-password?token=test-token');

    await user.type(screen.getByLabelText(/^mật khẩu mới$/i), 'NewPassword@123');
    await user.type(screen.getByLabelText(/xác nhận mật khẩu mới/i), 'DifferentPassword@123');
    await user.click(screen.getByRole('button', { name: /đặt lại mật khẩu/i }));

    expect(await screen.findByText(/mật khẩu xác nhận không khớp/i)).toBeInTheDocument();
    expect(authApi.resetPassword).not.toHaveBeenCalled();
  });

  it('shows an invalid or expired-token error from the API', async () => {
    vi.mocked(authApi.resetPassword).mockRejectedValueOnce(new ApiError('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', 400));
    const user = userEvent.setup();
    renderResetPage('/reset-password?token=expired-token');

    await user.type(screen.getByLabelText(/^mật khẩu mới$/i), 'NewPassword@123');
    await user.type(screen.getByLabelText(/xác nhận mật khẩu mới/i), 'NewPassword@123');
    await user.click(screen.getByRole('button', { name: /đặt lại mật khẩu/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/không hợp lệ hoặc đã hết hạn/i);
  });

  it('redirects to login after a successful reset', async () => {
    vi.mocked(authApi.resetPassword).mockResolvedValueOnce();
    const user = userEvent.setup();
    renderResetPage('/reset-password?token=valid-token');

    await user.type(screen.getByLabelText(/^mật khẩu mới$/i), 'NewPassword@123');
    await user.type(screen.getByLabelText(/xác nhận mật khẩu mới/i), 'NewPassword@123');
    await user.click(screen.getByRole('button', { name: /đặt lại mật khẩu/i }));

    expect(await screen.findByText('Login Page')).toBeInTheDocument();
    expect(authApi.resetPassword).toHaveBeenCalledWith({ token: 'valid-token', MatKhauMoi: 'NewPassword@123', confirmMatKhauMoi: 'NewPassword@123' });
  });
});
