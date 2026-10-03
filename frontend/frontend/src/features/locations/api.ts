import { apiClient } from '../../services/apiClient';
import type { LocationSummary } from '../hotels/types';

export const listLocations = async (): Promise<LocationSummary[]> => {
  const res = await apiClient<LocationSummary[]>('/locations');
  return res.data ?? [];
};
