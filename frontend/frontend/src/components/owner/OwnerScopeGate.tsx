import { OwnerHotelContextSelector } from './OwnerHotelContext';
import type { useScopedHotels } from './useScopedHotels';

/**
 * Top of every owner module page: the hotel selector, the scope state (loading, error, no hotel yet) and,
 * for an owner with several hotels who has not picked one, `prompt` saying what picking one will show.
 * The page renders its own content only when `scope.hotelId` is set.
 */
export function OwnerScopeGate({ scope, prompt }: { scope: ReturnType<typeof useScopedHotels>; prompt: string }) {
  const mustChoose =
    !scope.hotelsQuery.isLoading && !scope.hotelsQuery.error && !scope.invalidHotelId && !scope.hotelId && scope.hotels.length > 1;
  return (
    <>
      <OwnerHotelContextSelector hotels={scope.hotels} hotelId={scope.hotelId} onChange={scope.selectHotel} />
      {scope.state}
      {mustChoose && <div className="owner-scope-state">{prompt}</div>}
    </>
  );
}
