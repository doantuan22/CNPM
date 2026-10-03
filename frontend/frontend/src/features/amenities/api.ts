import { apiClient } from '../../services/apiClient';
import type { Amenity } from '../hotels/types';

export const listAmenities = async (): Promise<Amenity[]> => {
  const res = await apiClient<Amenity[]>('/amenities');
  return res.data ?? [];
};
