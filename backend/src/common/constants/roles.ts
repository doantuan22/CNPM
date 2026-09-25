/**
 * Canonical VAI_TRO.TenVaiTro values used by the platform.
 * Seeded by database/seed/001_roles.sql — kept in sync manually since
 * VAI_TRO has no fixed/enforced domain at the DB level (Chương 6.1).
 */
export const ROLE_NAMES = {
  CUSTOMER: 'Khách hàng',
  PARTNER: 'Chủ khách sạn',
  ADMIN: 'Quản trị hệ thống',
} as const;

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];
