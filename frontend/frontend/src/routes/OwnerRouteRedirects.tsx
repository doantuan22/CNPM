import { Navigate, useParams, useSearchParams } from 'react-router-dom';

function withParams(path: string, source: URLSearchParams, overrides: Record<string, string> = {}) {
  const next = new URLSearchParams(source);
  Object.entries(overrides).forEach(([key, value]) => next.set(key, value));
  const query = next.toString();
  return query ? `${path}?${query}` : path;
}

export function LegacyOwnerHotelRoute({ destination }: { destination: 'bookings' | 'revenue' | 'reports' | 'room-types' }) {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [params] = useSearchParams();
  const paths = { bookings: '/owner/bookings', revenue: '/owner/revenue', reports: '/owner/reports', 'room-types': '/owner/room-types' };
  return <Navigate replace to={withParams(paths[destination], params, { hotelId: hotelId ?? '' })} />;
}

export function LegacyOwnerBookingDetailRoute() {
  const { hotelId, bookingId } = useParams<{ hotelId: string; bookingId: string }>();
  const [params] = useSearchParams();
  return <Navigate replace to={withParams(`/owner/bookings/${bookingId}`, params, { hotelId: hotelId ?? '' })} />;
}

export function LegacyOwnerRoomTypeRoute() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [params] = useSearchParams();
  return <Navigate replace to={withParams('/owner/room-types', params, { hotelId: hotelId ?? '' })} />;
}

export function LegacyOwnerHotelDetailRoute() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [params] = useSearchParams();
  return <Navigate replace to={withParams(`/owner/hotels/${hotelId}`, params)} />;
}

export function LegacyOwnerModuleRoute({ to }: { to: string }) {
  const [params] = useSearchParams();
  return <Navigate replace to={withParams(to, params)} />;
}
