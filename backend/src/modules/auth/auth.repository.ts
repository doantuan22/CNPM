import { getPrismaClient } from '../../config/prisma';
import type { Prisma } from '../../generated/prisma/client';

export class AuthRepository {
  async findByEmail(email: string) {
    const prisma = getPrismaClient();
    return prisma.tAI_KHOAN.findUnique({ where: { Email: email } });
  }

  async findByUsername(tenDangNhap: string) {
    const prisma = getPrismaClient();
    return prisma.tAI_KHOAN.findUnique({ where: { TenDangNhap: tenDangNhap } });
  }

  async findByEmailOrUsername(identifier: string) {
    const prisma = getPrismaClient();
    return prisma.tAI_KHOAN.findFirst({
      where: { OR: [{ Email: identifier }, { TenDangNhap: identifier }] },
    });
  }

  async findById(maTaiKhoan: number) {
    const prisma = getPrismaClient();
    return prisma.tAI_KHOAN.findUnique({ where: { MaTaiKhoan: maTaiKhoan } });
  }

  async create(data: Prisma.TAI_KHOANCreateInput) {
    const prisma = getPrismaClient();
    return prisma.tAI_KHOAN.create({ data });
  }

  async updatePassword(maTaiKhoan: number, matKhauHash: string) {
    const prisma = getPrismaClient();
    return prisma.tAI_KHOAN.update({
      where: { MaTaiKhoan: maTaiKhoan },
      data: { MatKhau: matKhauHash, NgayCapNhat: new Date() },
    });
  }
}
