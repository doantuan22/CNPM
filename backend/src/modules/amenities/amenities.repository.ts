import { getPrismaClient } from '../../config/prisma';

export class AmenitiesRepository {
  async findAll() {
    const prisma = getPrismaClient();
    return prisma.tIEN_NGHI.findMany({ orderBy: { TenTienNghi: 'asc' } });
  }
}
