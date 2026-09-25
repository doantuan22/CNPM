import { getPrismaClient } from '../../config/prisma';
import type { Prisma } from '../../generated/prisma/client';

export class ProfileRepository {
  async findById(maTaiKhoan: number) {
    const prisma = getPrismaClient();
    return prisma.tAI_KHOAN.findUnique({ where: { MaTaiKhoan: maTaiKhoan } });
  }

  async update(maTaiKhoan: number, data: Prisma.TAI_KHOANUpdateInput) {
    const prisma = getPrismaClient();
    return prisma.tAI_KHOAN.update({ where: { MaTaiKhoan: maTaiKhoan }, data });
  }
}
