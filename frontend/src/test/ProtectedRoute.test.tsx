import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, makeFakeAccessToken } from './testUtils';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuthStore } from '../lib/authStore';
import { ROLE_NAMES } from '../lib/roles';

const renderProtected = (allowedRoles?: (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES][]) =>
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/" element={<div>Home Page</div>} />
      <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
        <Route path="/secret" element={<div>Secret Page</div>} />
      </Route>
    </Routes>,
    { route: '/secret' }
  );

describe('ProtectedRoute', () => {
  it('shows a loading indicator while bootstrapping', () => {
    useAuthStore.setState({ accessToken: null, role: null, isBootstrapping: true });
    renderProtected();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Secret Page')).not.toBeInTheDocument();
  });

  it('redirects to /login when there is no access token', () => {
    useAuthStore.setState({ accessToken: null, role: null, isBootstrapping: false });
    renderProtected();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders the protected content when authenticated with no role restriction', () => {
    useAuthStore.setState({
      accessToken: makeFakeAccessToken({ sub: '1', role: ROLE_NAMES.CUSTOMER }),
      role: ROLE_NAMES.CUSTOMER,
      isBootstrapping: false,
    });
    renderProtected();
    expect(screen.getByText('Secret Page')).toBeInTheDocument();
  });

  it('redirects home when the role is not in the allow-list (backend remains authority)', () => {
    useAuthStore.setState({
      accessToken: makeFakeAccessToken({ sub: '1', role: ROLE_NAMES.CUSTOMER }),
      role: ROLE_NAMES.CUSTOMER,
      isBootstrapping: false,
    });
    renderProtected([ROLE_NAMES.ADMIN]);
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Page')).not.toBeInTheDocument();
  });

  it('renders the protected content when the role matches the allow-list', () => {
    useAuthStore.setState({
      accessToken: makeFakeAccessToken({ sub: '1', role: ROLE_NAMES.ADMIN }),
      role: ROLE_NAMES.ADMIN,
      isBootstrapping: false,
    });
    renderProtected([ROLE_NAMES.ADMIN]);
    expect(screen.getByText('Secret Page')).toBeInTheDocument();
  });
});
