/**
 * Hotel Feature Domain Types (Foundation Definition)
 * Business use cases will be implemented in subsequent phases.
 */

export interface Hotel {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  rating?: number;
  starLevel?: number;
  featuredImageUrl?: string;
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  capacity: number;
  basePrice: number;
}
