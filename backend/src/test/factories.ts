import { getPrismaClient } from '../config/prisma';
import { hashPassword } from '../common/utils/password';
import { ACCOUNT_STATUS } from '../common/constants/account-status';
import { ROLE_NAMES, RoleName } from '../common/constants/roles';
import { HOTEL_STATUS, ROOM_TYPE_STATUS } from '../common/constants/hotel-status';
import { PROMOTION_STATUS, DISCOUNT_TYPE } from '../common/constants/commercial';

let roleIdCache: Map<string, number> | null = null;

export const getRoleId = async (roleName: RoleName): Promise<number> => {
  if (!roleIdCache) {
    const prisma = getPrismaClient();
    const roles = await prisma.vAI_TRO.findMany();
    roleIdCache = new Map(roles.map((r) => [r.TenVaiTro, r.MaVaiTro]));
  }
  const id = roleIdCache.get(roleName);
  if (!id) {
    throw new Error(
      `Role "${roleName}" not seeded — run database/seed/001_roles.sql against the test database first`
    );
  }
  return id;
};

let counter = 0;
// Date.now() alone can collide when test files run in parallel processes;
// mix in randomness + a per-module counter to keep TenDangNhap/Email unique.
const unique = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}_${++counter}`;

export interface TestAccountOptions {
  role?: RoleName;
  status?: string;
  password?: string;
}

export const createTestAccount = async (options: TestAccountOptions = {}) => {
  const prisma = getPrismaClient();
  const suffix = unique();
  const plainPassword = options.password ?? 'Test@12345';
  const roleId = await getRoleId(options.role ?? ROLE_NAMES.CUSTOMER);

  const account = await prisma.tAI_KHOAN.create({
    data: {
      TenDangNhap: `testuser_${suffix}`,
      Email: `test_${suffix}@example.com`,
      MatKhau: await hashPassword(plainPassword),
      HoTen: 'Test User',
      SoDienThoai: '0900000000',
      NgaySinh: new Date('1995-01-01'),
      GioiTinh: 'Khác',
      AnhDaiDien: '',
      TrangThai: options.status ?? ACCOUNT_STATUS.ACTIVE,
      NgayTao: new Date(),
      NgayCapNhat: new Date(),
      VAI_TRO: { connect: { MaVaiTro: roleId } },
    },
  });

  return { account, plainPassword };
};

export const deleteTestAccount = async (maTaiKhoan: number): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.hO_SO_DOI_TAC.deleteMany({ where: { MaTaiKhoan: maTaiKhoan } });
  await prisma.tAI_KHOAN.delete({ where: { MaTaiKhoan: maTaiKhoan } }).catch(() => undefined);
};

export const createTestDiaPhuong = async () => {
  const prisma = getPrismaClient();
  const suffix = unique();
  return prisma.dIA_PHUONG.create({
    data: { TenThanhPho: `TestCity_${suffix}`, TenTinh: `TestProvince_${suffix}`, QuocGia: 'Việt Nam' },
  });
};

export interface TestHotelOptions {
  status?: string;
}

export const createTestHotel = async (
  ownerId: number,
  maDiaPhuong: number,
  options: TestHotelOptions = {}
) => {
  const prisma = getPrismaClient();
  const suffix = unique();
  const now = new Date();
  return prisma.kHACH_SAN.create({
    data: {
      TenKhachSan: `Test Hotel ${suffix}`,
      DiaChiChiTiet: '1 Test Street',
      HangSao: 3,
      MoTa: 'Test hotel',
      GioNhanPhong: new Date('1970-01-01T14:00:00Z'),
      GioTraPhong: new Date('1970-01-01T12:00:00Z'),
      TrangThai: options.status ?? HOTEL_STATUS.ACTIVE,
      NgayDangKy: now,
      NgayCapNhat: now,
      TAI_KHOAN_KHACH_SAN_MaTaiKhoanSoHuuToTAI_KHOAN: { connect: { MaTaiKhoan: ownerId } },
      DIA_PHUONG: { connect: { MaDiaPhuong: maDiaPhuong } },
    },
  });
};

export const createTestRoomType = async (maKhachSan: number) => {
  const prisma = getPrismaClient();
  const suffix = unique();
  return prisma.lOAI_PHONG.create({
    data: {
      MaKhachSan: maKhachSan,
      TenLoaiPhong: `Test Room ${suffix}`,
      SoGiuong: 1,
      SucChua: 2,
      DienTich: 20,
      LoaiGiuong: 'Giường đôi',
      MoTa: 'Test room type',
      TrangThai: ROOM_TYPE_STATUS.ACTIVE,
    },
  });
};

/** Cascading cleanup for a hotel created via createTestHotel (room types, images, rates, amenities). */
export const deleteTestHotel = async (maKhachSan: number): Promise<void> => {
  const prisma = getPrismaClient();
  const roomTypes = await prisma.lOAI_PHONG.findMany({ where: { MaKhachSan: maKhachSan }, select: { MaLoaiPhong: true } });
  const roomTypeIds = roomTypes.map((r) => r.MaLoaiPhong);

  if (roomTypeIds.length > 0) {
    await prisma.qUY_PHONG_GIA.deleteMany({ where: { MaLoaiPhong: { in: roomTypeIds } } });
    await prisma.hINH_ANH_LOAI_PHONG.deleteMany({ where: { MaLoaiPhong: { in: roomTypeIds } } });
    await prisma.lOAI_PHONG_TIEN_NGHI.deleteMany({ where: { MaLoaiPhong: { in: roomTypeIds } } });
    await prisma.lOAI_PHONG.deleteMany({ where: { MaLoaiPhong: { in: roomTypeIds } } });
  }
  await prisma.hINH_ANH_KHACH_SAN.deleteMany({ where: { MaKhachSan: maKhachSan } });
  await prisma.kHACH_SAN_TIEN_NGHI.deleteMany({ where: { MaKhachSan: maKhachSan } });
  await prisma.kHACH_SAN.delete({ where: { MaKhachSan: maKhachSan } }).catch(() => undefined);
};

export const deleteTestDiaPhuong = async (maDiaPhuong: number): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.dIA_PHUONG.delete({ where: { MaDiaPhuong: maDiaPhuong } }).catch(() => undefined);
};

export const createTestAmenity = async () => {
  const prisma = getPrismaClient();
  const suffix = unique();
  return prisma.tIEN_NGHI.create({ data: { TenTienNghi: `TestAmenity_${suffix}`, BieuTuong: 'icon' } });
};

export const deleteTestAmenity = async (maTienNghi: number): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.tIEN_NGHI.delete({ where: { MaTienNghi: maTienNghi } }).catch(() => undefined);
};

export interface TestPromotionOptions {
  loaiGiamGia?: string;
  giaTriGiam?: number;
  giaTriDonToiThieu?: number;
  mucGiamToiDa?: number;
  soLuongGioiHan?: number;
  ngayBatDau?: Date;
  ngayKetThuc?: Date;
  trangThai?: string;
}

export const createTestPromotion = async (options: TestPromotionOptions = {}) => {
  const prisma = getPrismaClient();
  const suffix = unique();
  const today = new Date();
  const in30Days = new Date(Date.now() + 30 * 86400000);
  return prisma.kHUYEN_MAI.create({
    data: {
      MaCode: `TEST_${suffix}`.slice(0, 50).toUpperCase(),
      LoaiGiamGia: options.loaiGiamGia ?? DISCOUNT_TYPE.PERCENT,
      GiaTriGiam: options.giaTriGiam ?? 10,
      GiaTriDonToiThieu: options.giaTriDonToiThieu ?? 0,
      MucGiamToiDa: options.mucGiamToiDa ?? 0,
      SoLuongGioiHan: options.soLuongGioiHan ?? 0,
      NgayBatDau: options.ngayBatDau ?? today,
      NgayKetThuc: options.ngayKetThuc ?? in30Days,
      PhamViApDung: 'Toàn hệ thống',
      TrangThai: options.trangThai ?? PROMOTION_STATUS.ACTIVE,
    },
  });
};

export const deleteTestPromotion = async (maKhuyenMai: number): Promise<void> => {
  const prisma = getPrismaClient();
  await prisma.kHUYEN_MAI.delete({ where: { MaKhuyenMai: maKhuyenMai } }).catch(() => undefined);
};
