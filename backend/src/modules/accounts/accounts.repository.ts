import { getPrismaClient } from '../../config/prisma';
import type { Prisma } from '../../generated/prisma/client';
import type { ListAccountsQuery } from './accounts.schemas';

export class AccountsRepository {
  async list(query: ListAccountsQuery) {
    const prisma = getPrismaClient();
    const where: Prisma.TAI_KHOANWhereInput = {
      ...(query.TrangThai ? { TrangThai: query.TrangThai } : {}),
      ...(query.MaVaiTro ? { MaVaiTro: query.MaVaiTro } : {}),
      ...(query.search
        ? {
            OR: [
              { TenDangNhap: { contains: query.search } },
              { Email: { contains: query.search } },
              { HoTen: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.tAI_KHOAN.findMany({
        where,
        orderBy: { NgayTao: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.tAI_KHOAN.count({ where }),
    ]);

    return { items, total };
  }

  async findById(maTaiKhoan: number) {
    const prisma = getPrismaClient();
    return prisma.tAI_KHOAN.findUnique({ where: { MaTaiKhoan: maTaiKhoan } });
  }

  async findByEmail(email: string) {
    const prisma = getPrismaClient();
    return prisma.tAI_KHOAN.findUnique({ where: { Email: email } });
  }

  async findByUsername(tenDangNhap: string) {
    const prisma = getPrismaClient();
    return prisma.tAI_KHOAN.findUnique({ where: { TenDangNhap: tenDangNhap } });
  }

  async create(data: Prisma.TAI_KHOANCreateInput) {
    const prisma = getPrismaClient();
    return prisma.tAI_KHOAN.create({ data });
  }

  async update(maTaiKhoan: number, data: Prisma.TAI_KHOANUpdateInput) {
    const prisma = getPrismaClient();
    return prisma.tAI_KHOAN.update({ where: { MaTaiKhoan: maTaiKhoan }, data });
  }

  async setStatus(maTaiKhoan: number, trangThai: string) {
    const prisma = getPrismaClient();
    return prisma.tAI_KHOAN.update({
      where: { MaTaiKhoan: maTaiKhoan },
      data: { TrangThai: trangThai, NgayCapNhat: new Date() },
    });
  }

  /** G0-10: never hard-delete an account that has related history. */
  async hasDependentRecords(maTaiKhoan: number): Promise<boolean> {
    const prisma = getPrismaClient();
    const counts = await prisma.tAI_KHOAN.findUnique({
      where: { MaTaiKhoan: maTaiKhoan },
      select: {
        _count: {
          select: {
            DANH_GIA: true,
            DAT_PHONG: true,
            HO_SO_DOI_TAC_HO_SO_DOI_TAC_MaTaiKhoanToTAI_KHOAN: true,
            HO_SO_DOI_TAC_HO_SO_DOI_TAC_MaTaiKhoanDuyetToTAI_KHOAN: true,
            KHACH_SAN_KHACH_SAN_MaTaiKhoanDuyetToTAI_KHOAN: true,
            KHACH_SAN_KHACH_SAN_MaTaiKhoanSoHuuToTAI_KHOAN: true,
            YEU_CAU_HO_TRO_YEU_CAU_HO_TRO_MaTaiKhoanKhachHangToTAI_KHOAN: true,
            YEU_CAU_HO_TRO_YEU_CAU_HO_TRO_MaTaiKhoanXuLyToTAI_KHOAN: true,
          },
        },
      },
    });

    if (!counts) return false;
    return Object.values(counts._count).some((count) => count > 0);
  }

  async hardDelete(maTaiKhoan: number) {
    const prisma = getPrismaClient();
    return prisma.tAI_KHOAN.delete({ where: { MaTaiKhoan: maTaiKhoan } });
  }
}
