/**
 * YEU_CAU_HO_TRO.LoaiYeuCau — closed domain, enforced by
 * CK_YEU_CAU_HO_TRO_LoaiYeuCau (database/migrations/006_payment_after_sales.sql).
 */
export const SUPPORT_TYPE = {
  SUPPORT: 'Hỗ trợ',
  COMPLAINT: 'Khiếu nại',
} as const;

export type SupportType = (typeof SUPPORT_TYPE)[keyof typeof SUPPORT_TYPE];

/**
 * YEU_CAU_HO_TRO.TrangThai — open domain (no CK constraint), per
 * database/DATABASE_SOURCE_CHAPTER_6_7.md §6.22: "Mới, Đang xử lý, Đã xử lý,...".
 */
export const SUPPORT_STATUS = {
  NEW: 'Mới',
  IN_PROGRESS: 'Đang xử lý',
  RESOLVED: 'Đã xử lý',
} as const;

export type SupportStatus = (typeof SUPPORT_STATUS)[keyof typeof SUPPORT_STATUS];
