import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { HealthCheckData } from '../types/api';

export function useHealth(checkDb = false) {
  return useQuery({
    queryKey: ['health', { checkDb }],
    queryFn: async () => {
      const endpoint = checkDb ? '/health?db=true' : '/health';
      const response = await apiClient<HealthCheckData>(endpoint);
      return response.data;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}
