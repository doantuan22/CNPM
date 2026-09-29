import { useQuery } from '@tanstack/react-query';
import { listLocations } from './api';

export function useLocations(enabled = true) {
  return useQuery({ queryKey: ['locations'], queryFn: listLocations, staleTime: 1000 * 60 * 10, enabled });
}
