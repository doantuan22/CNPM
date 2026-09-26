import { getPrismaClient } from '../../config/prisma';
import type { Prisma } from '../../generated/prisma/client';
import type { AdminListReviewsQuery } from './reviews.schemas';

export interface CreateReviewData {
  maDatPhong: number;
  maKhachHang: number;
  maKhachSan: number;
  diemDanhGia: number;
  noiDung: string | null;
  trangThai: string;
}

export class ReviewsRepository {
  async findBookingForReview(maDatPhong: number) {
    const prisma = getPrismaClient();
    return prisma.dAT_PHONG.findUnique({
      where: { MaDatPhong: maDatPhong },
      select: { MaDatPhong: true, MaTaiKhoanKhachHang: true, MaKhachSan: true, TrangThai: true },
    });
  }

  async findByBookingId(maDatPhong: number) {
    const prisma = getPrismaClient();
    return prisma.dANH_GIA.findUnique({
      where: { MaDatPhong: maDatPhong },
      include: { HINH_ANH_DANH_GIA: true },
    });
  }

  async create(data: CreateReviewData, imageUrls: string[]) {
    const prisma = getPrismaClient();
    return prisma.dANH_GIA.create({
      data: {
        DAT_PHONG: { connect: { MaDatPhong: data.maDatPhong } },
        TAI_KHOAN: { connect: { MaTaiKhoan: data.maKhachHang } },
        KHACH_SAN: { connect: { MaKhachSan: data.maKhachSan } },
        DiemDanhGia: data.diemDanhGia,
        NoiDung: data.noiDung,
        TrangThai: data.trangThai,
        HINH_ANH_DANH_GIA: { create: imageUrls.map((url) => ({ URL: url })) },
      },
      include: { HINH_ANH_DANH_GIA: true },
    });
  }

  async findByIdAdmin(maDanhGia: number) {
    const prisma = getPrismaClient();
    return prisma.dANH_GIA.findUnique({
      where: { MaDanhGia: maDanhGia },
      include: {
        HINH_ANH_DANH_GIA: true,
        TAI_KHOAN: { select: { MaTaiKhoan: true, HoTen: true, Email: true } },
        KHACH_SAN: { select: { MaKhachSan: true, TenKhachSan: true } },
        DAT_PHONG: { select: { MaDatPhong: true, MaXacNhanDatPhong: true, NgayNhanPhong: true, NgayTraPhong: true } },
      },
    });
  }

  async listAdmin(query: AdminListReviewsQuery) {
    const prisma = getPrismaClient();
    const where: Prisma.DANH_GIAWhereInput = {
      ...(query.trangThai ? { TrangThai: query.trangThai } : {}),
      ...(query.search
        ? {
            OR: [
              { NoiDung: { contains: query.search } },
              { TAI_KHOAN: { HoTen: { contains: query.search } } },
              { KHACH_SAN: { TenKhachSan: { contains: query.search } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.dANH_GIA.findMany({
        where,
        orderBy: { MaDanhGia: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          HINH_ANH_DANH_GIA: true,
          TAI_KHOAN: { select: { MaTaiKhoan: true, HoTen: true, Email: true } },
          KHACH_SAN: { select: { MaKhachSan: true, TenKhachSan: true } },
        },
      }),
      prisma.dANH_GIA.count({ where }),
    ]);

    return { items, total };
  }

  async updateStatus(maDanhGia: number, trangThai: string) {
    const prisma = getPrismaClient();
    return prisma.dANH_GIA.update({ where: { MaDanhGia: maDanhGia }, data: { TrangThai: trangThai } });
  }
}
