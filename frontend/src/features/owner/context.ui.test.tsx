import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { OwnerHotelContextSelector } from '../../components/owner/OwnerHotelContext';
import { useOwnerHotelContext } from './context';
import type { OwnerHotel } from './types';

const hotels = [12, 34, 56].map((MaKhachSan) => ({ MaKhachSan, TenKhachSan: `Hotel ${MaKhachSan}` } as OwnerHotel));

function Probe() {
  const scope = useOwnerHotelContext();
  const location = useLocation();
  return <><OwnerHotelContextSelector hotels={scope.hotels} hotelId={scope.hotelId} onChange={scope.selectHotel} /><output data-testid="scope-id">{scope.hotelId ?? 'none'}</output><output data-testid="query">{location.search}</output><output data-testid="invalid">{String(scope.invalidHotelId)}</output></>;
}

function renderProbe(hotelData: OwnerHotel[], route: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(['owner', 'hotels'], hotelData);
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[route]}><Probe /></MemoryRouter></QueryClientProvider>);
}

describe('owner hotel context UI and URL state', () => {
  it('auto-selects the only hotel and writes it to the URL', async () => {
    renderProbe(hotels.slice(0, 1), '/owner/revenue');
    await waitFor(() => expect(screen.getByTestId('query')).toHaveTextContent('hotelId=12'));
    expect(screen.getByTestId('scope-id')).toHaveTextContent('12');
    expect(screen.queryByRole('combobox', { name: 'Chọn khách sạn' })).not.toBeInTheDocument();
  });

  it('lets owners with multiple hotels switch scope in the current module URL', async () => {
    renderProbe(hotels, '/owner/reports');
    const selector = screen.getByRole('combobox', { name: 'Chọn khách sạn' });
    fireEvent.change(selector, { target: { value: '34' } });
    await waitFor(() => expect(screen.getByTestId('query')).toHaveTextContent('hotelId=34'));
    expect(screen.getByTestId('scope-id')).toHaveTextContent('34');
  });

  it('clears a hotel ID outside the owner hotel list', async () => {
    renderProbe(hotels, '/owner/bookings?hotelId=999');
    await waitFor(() => expect(screen.getByTestId('query')).toHaveTextContent(/^$/));
    expect(screen.getByTestId('scope-id')).toHaveTextContent('none');
    expect(screen.getByTestId('invalid')).toHaveTextContent('true');
  });
});
