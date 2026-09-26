/**
 * KHUYEN_MAI.TrangThai — open domain (Chương 6.15: "Hoạt động, Hết hạn, Ngừng,...").
 * Only ACTIVE promotions (and within their date window) can ever be applied.
 * `INACTIVE` ("Ngừng") is M8's admin bật/tắt toggle — "Hết hạn" is deliberately
 * not a stored value here: it's already fully derived from NgayKetThuc by
 * evaluatePromotion() regardless of TrangThai, so persisting it would just be
 * a second, potentially stale source of truth for the same fact.
 */
export const PROMOTION_STATUS = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Ngừng',
} as const;

export type PromotionStatus = (typeof PROMOTION_STATUS)[keyof typeof PROMOTION_STATUS];

/** KHUYEN_MAI.LoaiGiamGia — closed domain, enforced by CK_KHUYEN_MAI_LoaiGiamGia. */
export const DISCOUNT_TYPE = {
  PERCENT: 'Phần trăm',
  FIXED_AMOUNT: 'Số tiền cố định',
} as const;

/**
 * KHUYEN_MAI.PhamViApDung — closed domain, enforced by CK_KHUYEN_MAI_PhamViApDung.
 * Per Gate 0 (G0-01), KHUYEN_MAI_KHACH_SAN (the hotel-scoping join table) is
 * forbidden, so there is no data to actually scope a "Theo phạm vi" promotion
 * to specific hotels. M4 therefore treats every promotion as applying
 * system-wide regardless of this field's value — see docs/m4-report.md.
 */
export const PROMOTION_SCOPE = {
  SYSTEM_WIDE: 'Toàn hệ thống',
  SCOPED: 'Theo phạm vi',
} as const;

/** CHINH_SACH_HUY.TrangThai — open domain (Chương 6.13: "Hoạt động, Ngừng áp dụng,..."). */
export const CANCELLATION_POLICY_STATUS = {
  ACTIVE: 'Hoạt động',
} as const;
