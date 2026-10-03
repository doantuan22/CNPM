import { useQuery } from '@tanstack/react-query';
import { listAmenities } from './api';

export function useAmenities() {
  return useQuery({
    queryKey: ['amenities'],
    queryFn: listAmenities,
    staleTime: 1000 * 60 * 10,
  });
}
