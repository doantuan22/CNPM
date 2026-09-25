import { getPrismaClient } from '../../config/prisma';

export class RolesRepository {
  async findByName(tenVaiTro: string) {
    const prisma = getPrismaClient();
    return prisma.vAI_TRO.findUnique({ where: { TenVaiTro: tenVaiTro } });
  }

  async findById(maVaiTro: number) {
    const prisma = getPrismaClient();
    return prisma.vAI_TRO.findUnique({ where: { MaVaiTro: maVaiTro } });
  }
}
