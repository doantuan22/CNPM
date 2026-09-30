// Mirrors backend/src/common/constants/roles.ts — VAI_TRO.TenVaiTro values.
export const ROLE_NAMES = {
  CUSTOMER: 'Khách hàng',
  PARTNER: 'Chủ khách sạn',
  ADMIN: 'Quản trị hệ thống',
} as const;

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];

/** Where each role lands after signing in (or when an already signed-in user opens a guest-only page). */
export const ROLE_HOME: Record<string, string> = {
  [ROLE_NAMES.ADMIN]: '/admin',
  [ROLE_NAMES.PARTNER]: '/owner',
  [ROLE_NAMES.CUSTOMER]: '/',
};

/** Each role's own profile page: inside their area, so admins and owners stay in their dashboard. */
export const PROFILE_PATH: Record<string, string> = {
  [ROLE_NAMES.ADMIN]: '/admin/profile',
  [ROLE_NAMES.PARTNER]: '/owner/profile',
  [ROLE_NAMES.CUSTOMER]: '/profile',
};

export const profilePathFor = (role: string | null): string => (role && PROFILE_PATH[role]) || '/profile';
