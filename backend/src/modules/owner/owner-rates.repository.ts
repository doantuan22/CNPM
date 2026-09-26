import { getPrismaClient } from '../../config/prisma';

export interface RateUpsertItem {
  NgayApDung: Date;
  GiaPhong: number;
  SoLuongPhong: number;
  TrangThai: string;
}

export class OwnerRatesRepository {
  async listForRoomType(maLoaiPhong: number, from: Date, to: Date) {
    const prisma = getPrismaClient();
    return prisma.qUY_PHONG_GIA.findMany({
      where: { MaLoaiPhong: maLoaiPhong, NgayApDung: { gte: from, lte: to } },
      orderBy: { NgayApDung: 'asc' },
    });
  }

  /** Upserts each row against UQ_QUY_PHONG_GIA_MaLoaiPhong_NgayApDung — never creates a duplicate. */
  async bulkUpsert(maLoaiPhong: number, items: RateUpsertItem[]) {
    const prisma = getPrismaClient();
    return prisma.$transaction(
      items.map((item) =>
        prisma.qUY_PHONG_GIA.upsert({
          where: { MaLoaiPhong_NgayApDung: { MaLoaiPhong: maLoaiPhong, NgayApDung: item.NgayApDung } },
          update: { GiaPhong: item.GiaPhong, SoLuongPhong: item.SoLuongPhong, TrangThai: item.TrangThai },
          create: {
            MaLoaiPhong: maLoaiPhong,
            NgayApDung: item.NgayApDung,
            GiaPhong: item.GiaPhong,
            SoLuongPhong: item.SoLuongPhong,
            TrangThai: item.TrangThai,
          },
        })
      )
    );
  }
}
