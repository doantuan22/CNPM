import { getPrismaClient } from '../../config/prisma';
import { CANCELLATION_POLICY_STATUS } from '../../common/constants/commercial';

export class CancellationPoliciesRepository {
  async findAllActive() {
    const prisma = getPrismaClient();
    return prisma.cHINH_SACH_HUY.findMany({
      where: { TrangThai: CANCELLATION_POLICY_STATUS.ACTIVE },
      include: { CHI_TIET_CHINH_SACH_HUY: { orderBy: { SoGioTruocNhanPhong: 'desc' } } },
      orderBy: { MaChinhSachHuy: 'asc' },
    });
  }

  async findById(maChinhSachHuy: number) {
    const prisma = getPrismaClient();
    return prisma.cHINH_SACH_HUY.findUnique({
      where: { MaChinhSachHuy: maChinhSachHuy },
      include: { CHI_TIET_CHINH_SACH_HUY: { orderBy: { SoGioTruocNhanPhong: 'desc' } } },
    });
  }

  /**
   * CHINH_SACH_HUY has no MaKhachSan/MaDatPhong (Gate 0 G0-03 + system-level
   * modeling per M1 DDI notes) — there is no per-hotel mapping to resolve
   * "the" policy from. M4 treats the oldest still-ACTIVE policy (lowest id)
   * as the single system-wide default applied to every quote. Deterministic
   * and stable: any policy created later (e.g. by an admin) never displaces it.
   */
  async findActiveDefault() {
    const prisma = getPrismaClient();
    return prisma.cHINH_SACH_HUY.findFirst({
      where: { TrangThai: CANCELLATION_POLICY_STATUS.ACTIVE },
      include: { CHI_TIET_CHINH_SACH_HUY: { orderBy: { SoGioTruocNhanPhong: 'desc' } } },
      orderBy: { MaChinhSachHuy: 'asc' },
    });
  }
}
