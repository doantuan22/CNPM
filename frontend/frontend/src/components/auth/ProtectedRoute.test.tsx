import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { FeedbackProvider } from '../common/FeedbackProvider';
import { useAuthStore } from '../../lib/authStore';
import { ROLE_NAMES } from '../../lib/roles';

function renderProtected(route: string) {
  return render(
    <StrictMode>
      <MemoryRouter initialEntries={[route]}>
        <FeedbackProvider>
          <Routes>
            <Route path="/" element={<div>trang chủ</div>} />
            <Route path="/login" element={<div>trang đăng nhập</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/bookings" element={<div>đặt phòng của tôi</div>} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={[ROLE_NAMES.ADMIN]} />}>
              <Route path="/admin" element={<div>khu quản trị</div>} />
            </Route>
          </Routes>
        </FeedbackProvider>
      </MemoryRouter>
    </StrictMode>
  );
}

const setAuth = (patch: { accessToken: string | null; role: string | null; isBootstrapping: boolean }) => useAuthStore.setState(patch);

beforeEach(() => setAuth({ accessToken: null, role: null, isBootstrapping: false }));

describe('ProtectedRoute', () => {
  it('waits for the session restore instead of redirecting', () => {
    setAuth({ accessToken: null, role: null, isBootstrapping: true });
    renderProtected('/admin');

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('trang đăng nhập')).not.toBeInTheDocument();
    expect(screen.queryByText('trang chủ')).not.toBeInTheDocument();
  });

  it('sends a visitor without a session to the login page, without a permission toast', () => {
    renderProtected('/admin');

    expect(screen.getByText('trang đăng nhập')).toBeInTheDocument();
    expect(screen.queryByText(/không có quyền/i)).not.toBeInTheDocument();
  });

  it('lets a signed-in user with the right role through', () => {
    setAuth({ accessToken: 'token', role: ROLE_NAMES.ADMIN, isBootstrapping: false });
    renderProtected('/admin');

    expect(screen.getByText('khu quản trị')).toBeInTheDocument();
    expect(screen.queryByText(/không có quyền/i)).not.toBeInTheDocument();
  });

  it('sends a signed-in user with the wrong role home and tells them why, once', () => {
    setAuth({ accessToken: 'token', role: ROLE_NAMES.CUSTOMER, isBootstrapping: false });
    renderProtected('/admin');

    expect(screen.getByText('trang chủ')).toBeInTheDocument();
    expect(screen.queryByText('khu quản trị')).not.toBeInTheDocument();
    expect(screen.getAllByText('Bạn không có quyền truy cập trang này')).toHaveLength(1);
  });

  it('shows no toast on a route that has no role restriction', () => {
    setAuth({ accessToken: 'token', role: ROLE_NAMES.CUSTOMER, isBootstrapping: false });
    renderProtected('/bookings');

    expect(screen.getByText('đặt phòng của tôi')).toBeInTheDocument();
    expect(screen.queryByText(/không có quyền/i)).not.toBeInTheDocument();
  });
});
