import { apiClient } from '../../services/apiClient';
import type { DiaPhuong } from '../hotels/types';

export const listLocations = async (): Promise<DiaPhuong[]> => {
  const res = await apiClient<DiaPhuong[]>('/locations');
  return res.data ?? [];
};
