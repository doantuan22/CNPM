import { OwnerHotelScopeState } from './OwnerHotelContext';
import { useOwnerHotelContext } from '../../features/owner/context';

export function useScopedHotels() {
  const scope = useOwnerHotelContext();
  const state = (
    <OwnerHotelScopeState
      loading={scope.hotelsQuery.isLoading}
      error={scope.hotelsQuery.error}
      empty={!scope.hotelsQuery.isLoading && !scope.hotelsQuery.error && scope.hotels.length === 0}
      invalid={scope.invalidHotelId}
    />
  );
  return { ...scope, state };
}
