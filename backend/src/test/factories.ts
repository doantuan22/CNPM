import { getPrismaClient } from '../config/prisma';
import { hashPassword } from '../common/utils/password';
import { ACCOUNT_STATUS } from '../common/constants/account-status';
import { ROLE_NAMES, RoleName } from '../common/constants/roles';

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
