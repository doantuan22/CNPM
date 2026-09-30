import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OwnerScopeGate } from './OwnerScopeGate';
import { renderWithProviders } from '../../test/testUtils';
import type { useScopedHotels } from './useScopedHotels';

type Scope = ReturnType<typeof useScopedHotels>;

const hotel = (id: number) => ({ MaKhachSan: id, TenKhachSan: `Khách sạn ${id}` });

const scope = (patch: Partial<Record<string, unknown>> = {}) =>
  ({
    hotels: [hotel(1), hotel(2)],
    hotelId: null,
    hotelsQuery: { isLoading: false, error: null },
    invalidHotelId: false,
    selectHotel: vi.fn(),
    state: <div data-testid="scope-state" />,
    ...patch,
  }) as unknown as Scope;

const prompt = 'Chọn khách sạn để xem dữ liệu.';

describe('OwnerScopeGate', () => {
  it('asks an owner with several hotels to pick one before showing anything', () => {
    renderWithProviders(<OwnerScopeGate scope={scope()} prompt={prompt} />);

    expect(screen.getByRole('combobox', { name: 'Chọn khách sạn' })).toBeInTheDocument();
    expect(screen.getByText(prompt)).toBeInTheDocument();
  });

  it('shows the scope state (loading, error, no hotels) it is given', () => {
    renderWithProviders(<OwnerScopeGate scope={scope()} prompt={prompt} />);
    expect(screen.getByTestId('scope-state')).toBeInTheDocument();
  });

  it('does not nag once a hotel is chosen', () => {
    renderWithProviders(<OwnerScopeGate scope={scope({ hotelId: 2 })} prompt={prompt} />);
    expect(screen.queryByText(prompt)).not.toBeInTheDocument();
  });

  it.each([
    ['there is only one hotel (it is chosen automatically)', { hotels: [hotel(1)] }],
    ['the hotels are still loading', { hotelsQuery: { isLoading: true, error: null } }],
    ['loading the hotels failed', { hotelsQuery: { isLoading: false, error: new Error('x') } }],
    ['the hotel in the link is not one of theirs', { invalidHotelId: true }],
  ])('does not ask to pick a hotel when %s', (_name, patch) => {
    renderWithProviders(<OwnerScopeGate scope={scope(patch)} prompt={prompt} />);
    expect(screen.queryByText(prompt)).not.toBeInTheDocument();
  });
});
