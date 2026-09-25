/**
 * TAI_KHOAN.TrangThai values used by the platform (open domain — no DB CHECK,
 * Chương 6.2 lists "Hoạt động, Khóa,..." as an example, not a closed set).
 */
export const ACCOUNT_STATUS = {
  ACTIVE: 'Hoạt động',
  LOCKED: 'Khóa',
} as const;

export type AccountStatus = (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

/**
 * HO_SO_DOI_TAC.TrangThaiDuyet — closed domain, enforced by
 * CK_HO_SO_DOI_TAC_TrangThaiDuyet in database/migrations/001_core_identity.sql.
 * Values must match that CHECK constraint exactly.
 */
export const PARTNER_APPLICATION_STATUS = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
} as const;

export type PartnerApplicationStatus =
  (typeof PARTNER_APPLICATION_STATUS)[keyof typeof PARTNER_APPLICATION_STATUS];
