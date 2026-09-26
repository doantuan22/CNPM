import { OwnerRatesRepository } from './owner-rates.repository';
import { OwnerRoomTypesService } from './owner-room-types.service';
import type { ListRatesQuery, BulkUpsertRatesInput } from './owner-rates.schemas';

export class OwnerRatesService {
  constructor(
    private readonly repository: OwnerRatesRepository = new OwnerRatesRepository(),
    private readonly roomTypesService: OwnerRoomTypesService = new OwnerRoomTypesService()
  ) {}

  async list(ownerId: number, maLoaiPhong: number, query: ListRatesQuery) {
    await this.roomTypesService.getOwnedRoomType(ownerId, maLoaiPhong);
    return this.repository.listForRoomType(maLoaiPhong, query.from, query.to);
  }

  async bulkUpsert(ownerId: number, maLoaiPhong: number, input: BulkUpsertRatesInput) {
    await this.roomTypesService.getOwnedRoomType(ownerId, maLoaiPhong);
    return this.repository.bulkUpsert(maLoaiPhong, input.rates);
  }
}
