import { getPrismaClient } from '../../config/prisma';

export class LocationsRepository {
  async findAll() {
    const prisma = getPrismaClient();
    return prisma.dIA_PHUONG.findMany({ orderBy: { TenThanhPho: 'asc' } });
  }
}
