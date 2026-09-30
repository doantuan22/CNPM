import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '../components/layouts/MainLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { GuestOnlyRoute } from '../components/auth/GuestOnlyRoute';
import { ROLE_NAMES } from '../lib/roles';
import { aliasRoutes } from './aliases';
import HomePage from '../pages/HomePage';
import { LegacyOwnerBookingDetailRoute, LegacyOwnerHotelDetailRoute, LegacyOwnerHotelRoute, LegacyOwnerModuleRoute, LegacyOwnerRoomTypeRoute } from './OwnerRouteRedirects';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const PartnerApplyPage = lazy(() => import('../pages/PartnerApplyPage'));
const HotelListPage = lazy(() => import('../pages/HotelListPage'));
const HotelDetailPage = lazy(() => import('../pages/HotelDetailPage'));
const BookingsPage = lazy(() => import('../pages/BookingsPage'));
const BookingDetailPage = lazy(() => import('../pages/BookingDetailPage'));
const PaymentResultPage = lazy(() => import('../pages/PaymentResultPage'));
const SupportPage = lazy(() => import('../pages/SupportPage'));
const SupportDetailPage = lazy(() => import('../pages/SupportDetailPage'));
const OwnerDashboardPage = lazy(() => import('../pages/OwnerDashboardPage'));
const OwnerHotelFormPage = lazy(() => import('../pages/OwnerHotelFormPage'));
const OwnerHotelManagePage = lazy(() => import('../pages/OwnerHotelManagePage'));
const OwnerRoomTypeManagePage = lazy(() => import('../pages/OwnerRoomTypeManagePage'));
const OwnerBookingsPage = lazy(() => import('../pages/OwnerBookingsPage'));
const OwnerBookingDetailPage = lazy(() => import('../pages/OwnerBookingDetailPage'));
const OwnerRoomTypesPage = lazy(() => import('../pages/OwnerModulesPage').then((module) => ({ default: module.OwnerRoomTypesPage })));
const OwnerInventoryPricingPage = lazy(() => import('../pages/OwnerModulesPage').then((module) => ({ default: module.OwnerInventoryPricingPage })));
const OwnerRevenuePage = lazy(() => import('../pages/OwnerModulesPage').then((module) => ({ default: module.OwnerRevenuePage })));
const OwnerReportsPage = lazy(() => import('../pages/OwnerModulesPage').then((module) => ({ default: module.OwnerReportsPage })));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'));
const AdminAnalyticsPage = lazy(() => import('../pages/AdminAnalyticsPage'));
const AdminPromotionsPage = lazy(() => import('../pages/AdminPromotionsPage'));
const AdminPromotionFormPage = lazy(() => import('../pages/AdminPromotionFormPage'));
const AdminAccountsPage = lazy(() => import('../pages/AdminAccountsPage'));
const AdminAccountDetailPage = lazy(() => import('../pages/AdminAccountDetailPage'));
const AdminCreateAccountPage = lazy(() => import('../pages/AdminCreateAccountPage'));
const AdminHotelsPage = lazy(() => import('../pages/AdminHotelsPage'));
const AdminHotelDetailPage = lazy(() => import('../pages/AdminHotelDetailPage'));
const AdminPaymentsPage = lazy(() => import('../pages/AdminPaymentsPage'));
const AdminPaymentDetailPage = lazy(() => import('../pages/AdminPaymentDetailPage'));
const AdminReviewsPage = lazy(() => import('../pages/AdminReviewsPage'));
const AdminReviewDetailPage = lazy(() => import('../pages/AdminReviewDetailPage'));
const AdminSupportPage = lazy(() => import('../pages/AdminSupportPage'));
const AdminSupportDetailPage = lazy(() => import('../pages/AdminSupportDetailPage'));
const AdminPartnerApplicationsPage = lazy(() => import('../pages/AdminPartnerApplicationsPage'));
const AdminPartnerApplicationDetailPage = lazy(() => import('../pages/AdminPartnerApplicationDetailPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16" role="status" aria-live="polite"><span className="sr-only">Đang tải trang...</span><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" /></div>}>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
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
          <Route path="/support" element={<SupportPage />} />
          <Route path="/support/:id" element={<SupportDetailPage />} />
        </Route>

        {/* Chủ khách sạn */}
        <Route element={<ProtectedRoute allowedRoles={[ROLE_NAMES.PARTNER]} />}>
          <Route path="/owner" element={<LegacyOwnerModuleRoute to="/owner/overview" />} />
          <Route path="/owner/overview" element={<OwnerDashboardPage mode="overview" />} />
          <Route path="/owner/hotels" element={<OwnerDashboardPage mode="hotels" />} />
          <Route path="/owner/hotels/new" element={<OwnerHotelFormPage />} />
          <Route path="/owner/hotels/:hotelId" element={<OwnerHotelManagePage />} />
          <Route path="/owner/room-types" element={<OwnerRoomTypesPage />} />
          <Route path="/owner/room-types/:roomTypeId" element={<OwnerRoomTypeManagePage />} />
          <Route path="/owner/inventory-pricing" element={<OwnerInventoryPricingPage />} />
          <Route path="/owner/bookings" element={<OwnerBookingsPage />} />
          <Route path="/owner/bookings/:bookingId" element={<OwnerBookingDetailPage />} />
          <Route path="/owner/revenue" element={<OwnerRevenuePage />} />
          <Route path="/owner/reports" element={<OwnerReportsPage />} />
          <Route path="/owner/profile" element={<ProfilePage />} />

          {/* Controlled legacy aliases retain semantic IDs and hotel context. */}
          <Route path="/partner/dashboard" element={<LegacyOwnerModuleRoute to="/owner/overview" />} />
          <Route path="/partner/hotels" element={<LegacyOwnerModuleRoute to="/owner/hotels" />} />
          <Route path="/partner/hotels/new" element={<LegacyOwnerModuleRoute to="/owner/hotels/new" />} />
          <Route path="/partner/hotels/:hotelId" element={<LegacyOwnerHotelDetailRoute />} />
          <Route path="/partner/hotels/:hotelId/bookings/:bookingId" element={<LegacyOwnerBookingDetailRoute />} />
          <Route path="/partner/hotels/:hotelId/bookings" element={<LegacyOwnerHotelRoute destination="bookings" />} />
          <Route path="/partner/hotels/:hotelId/room-types" element={<LegacyOwnerRoomTypeRoute />} />
          <Route path="/owner/hotels/:hotelId/bookings/:bookingId" element={<LegacyOwnerBookingDetailRoute />} />
          <Route path="/owner/hotels/:hotelId/bookings" element={<LegacyOwnerHotelRoute destination="bookings" />} />
          <Route path="/owner/hotels/:hotelId/analytics" element={<LegacyOwnerHotelRoute destination="revenue" />} />
          <Route path="/partner/bookings" element={<LegacyOwnerModuleRoute to="/owner/bookings" />} />
          <Route path="/partner/inventory-pricing" element={<LegacyOwnerModuleRoute to="/owner/inventory-pricing" />} />
          <Route path="/partner/reports" element={<LegacyOwnerModuleRoute to="/owner/reports" />} />
          <Route path="/partner/revenue" element={<LegacyOwnerModuleRoute to="/owner/revenue" />} />
          <Route path="/partner/room-types" element={<LegacyOwnerModuleRoute to="/owner/room-types" />} />
          <Route path="/partner/room-type-form" element={<LegacyOwnerModuleRoute to="/owner/room-types" />} />
          <Route path="/partner/hotel-form" element={<LegacyOwnerModuleRoute to="/owner/hotels/new" />} />
        </Route>

        {/* Quản trị hệ thống */}
        <Route element={<ProtectedRoute allowedRoles={[ROLE_NAMES.ADMIN]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/accounts" element={<AdminAccountsPage />} />
          <Route path="/admin/accounts/new" element={<AdminCreateAccountPage />} />
          <Route path="/admin/hotels" element={<AdminHotelsPage />} />
          <Route path="/admin/hotels/:id" element={<AdminHotelDetailPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/payments/:id" element={<AdminPaymentDetailPage />} />
          <Route path="/admin/accounts/:id" element={<AdminAccountDetailPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/reviews/:id" element={<AdminReviewDetailPage />} />
          <Route path="/admin/support" element={<AdminSupportPage />} />
          <Route path="/admin/support/:id" element={<AdminSupportDetailPage />} />
          <Route path="/admin/partner-applications" element={<AdminPartnerApplicationsPage />} />
          <Route path="/admin/partner-applications/:id" element={<AdminPartnerApplicationDetailPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/promotions" element={<AdminPromotionsPage />} />
          <Route path="/admin/promotions/new" element={<AdminPromotionFormPage />} />
          <Route path="/admin/promotions/:id" element={<AdminPromotionFormPage />} />
        </Route>

        {/* Legacy URLs kept only as redirects to their canonical route. */}
        {aliasRoutes()}

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
