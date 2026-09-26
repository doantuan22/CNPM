/**
 * DANH_GIA.TrangThai — open domain (no CK constraint), per
 * database/DATABASE_SOURCE_CHAPTER_6_7.md §6.20: "Hiển thị, Ẩn, Vi phạm,...".
 * `PENDING` ("Chờ duyệt") is this module's own addition for the state
 * before any admin moderation action — same open-domain pattern already
 * used for KHACH_SAN/HO_SO_DOI_TAC ("Chờ duyệt" → acted on by an admin).
 */
export const REVIEW_STATUS = {
  PENDING: 'Chờ duyệt',
  VISIBLE: 'Hiển thị',
  HIDDEN: 'Ẩn',
  VIOLATION: 'Vi phạm',
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];
