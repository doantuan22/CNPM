import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { GuestOnlyRoute } from '../components/auth/GuestOnlyRoute';
import HomePage from '../pages/public/HomePage';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const HotelListPage = lazy(() => import('../pages/public/HotelListPage'));
const HotelDetailPage = lazy(() => import('../pages/public/HotelDetailPage'));

/** Pages anyone can open (a signed-in user is sent away from the sign-in/register pages). */
export const publicRoutes = (
  <>
    <Route path="/" element={<HomePage />} />
    <Route element={<GuestOnlyRoute />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Route>
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/hotels" element={<HotelListPage />} />
    <Route path="/hotels/:id" element={<HotelDetailPage />} />
  </>
);
