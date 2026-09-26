import { Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ROLE_NAMES } from '../lib/roles';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ProfilePage from '../pages/ProfilePage';
import PartnerApplyPage from '../pages/PartnerApplyPage';
import HotelListPage from '../pages/HotelListPage';
import HotelDetailPage from '../pages/HotelDetailPage';
import BookingsPage from '../pages/BookingsPage';
import BookingDetailPage from '../pages/BookingDetailPage';
import PaymentResultPage from '../pages/PaymentResultPage';
import OwnerDashboardPage from '../pages/OwnerDashboardPage';
import OwnerHotelFormPage from '../pages/OwnerHotelFormPage';
import OwnerHotelManagePage from '../pages/OwnerHotelManagePage';
import OwnerRoomTypeManagePage from '../pages/OwnerRoomTypeManagePage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminAccountsPage from '../pages/AdminAccountsPage';
import AdminAccountDetailPage from '../pages/AdminAccountDetailPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/hotels" element={<HotelListPage />} />
        <Route path="/hotels/:id" element={<HotelDetailPage />} />

        {/* Any authenticated account */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/partner/apply" element={<PartnerApplyPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/bookings/:id" element={<BookingDetailPage />} />
          <Route path="/payment/result" element={<PaymentResultPage />} />
        </Route>

        {/* Chủ khách sạn */}
        <Route element={<ProtectedRoute allowedRoles={[ROLE_NAMES.PARTNER]} />}>
          <Route path="/owner" element={<OwnerDashboardPage />} />
          <Route path="/owner/hotels/new" element={<OwnerHotelFormPage />} />
          <Route path="/owner/hotels/:id" element={<OwnerHotelManagePage />} />
          <Route path="/owner/room-types/:id" element={<OwnerRoomTypeManagePage />} />
        </Route>

        {/* Quản trị hệ thống */}
        <Route element={<ProtectedRoute allowedRoles={[ROLE_NAMES.ADMIN]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/accounts" element={<AdminAccountsPage />} />
          <Route path="/admin/accounts/:id" element={<AdminAccountDetailPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
