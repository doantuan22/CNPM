import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { LegacyOwnerBookingDetailRoute, LegacyOwnerHotelRoute, LegacyOwnerRoomTypeRoute } from './OwnerRouteRedirects';

function LocationProbe() {
  const location = useLocation();
  return <output>{location.pathname}{location.search}</output>;
}

function renderLegacy(path: string, oldPath: string, element: ReactNode) {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path={oldPath} element={element} /><Route path="*" element={<LocationProbe />} /></Routes></MemoryRouter>);
}

describe('owner route migrations', () => {
  it('converts the legacy hotel room-types route ID to hotelId context', () => {
    renderLegacy('/partner/hotels/42/room-types', '/partner/hotels/:hotelId/room-types', <LegacyOwnerRoomTypeRoute />);
    expect(screen.getByText('/owner/room-types?hotelId=42')).toBeInTheDocument();
  });

  it('keeps hotel scope when migrating the analytics route to Revenue', () => {
    renderLegacy('/owner/hotels/42/analytics?from=2026-09-01', '/owner/hotels/:hotelId/analytics', <LegacyOwnerHotelRoute destination="revenue" />);
    expect(screen.getByText('/owner/revenue?from=2026-09-01&hotelId=42')).toBeInTheDocument();
  });

  it('keeps both semantic IDs when migrating booking detail', () => {
    renderLegacy('/owner/hotels/42/bookings/99', '/owner/hotels/:hotelId/bookings/:bookingId', <LegacyOwnerBookingDetailRoute />);
    expect(screen.getByText('/owner/bookings/99?hotelId=42')).toBeInTheDocument();
  });
});
