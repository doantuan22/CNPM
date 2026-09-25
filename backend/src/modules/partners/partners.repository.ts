import { getPrismaClient } from '../../config/prisma';
import type { Prisma } from '../../generated/prisma/client';

export class PartnersRepository {
  async findLatestByAccount(maTaiKhoan: number) {
    const prisma = getPrismaClient();
    return prisma.hO_SO_DOI_TAC.findFirst({
      where: { MaTaiKhoan: maTaiKhoan },
      orderBy: { NgayNop: 'desc' },
    });
  }

  async create(data: Prisma.HO_SO_DOI_TACCreateInput) {
    const prisma = getPrismaClient();
    return prisma.hO_SO_DOI_TAC.create({ data });
  }
}
