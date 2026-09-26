/**
 * Pure cross-field validation shared by create and update (M8 §1) — the
 * per-field range checks (GiaTriGiam > 0, GiaTriDonToiThieu >= 0, etc.) live
 * in the Zod schema and mirror the DB CHECK constraints exactly
 * (database/migrations/004_commercial.sql); this only covers checks that
 * need two fields together, which Zod's `.partial()` update schema can't
 * express on its own (a PATCH may touch only one of the two dates).
 */
import { DISCOUNT_TYPE } from '../../common/constants/commercial';

export interface PromotionFields {
  LoaiGiamGia: string;
  GiaTriGiam: number;
  NgayBatDau: Date;
  NgayKetThuc: Date;
}

export const validatePromotionFields = (fields: PromotionFields): string | null => {
  if (fields.NgayKetThuc.getTime() < fields.NgayBatDau.getTime()) {
    return 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu';
  }
  if (fields.LoaiGiamGia === DISCOUNT_TYPE.PERCENT && fields.GiaTriGiam > 100) {
    return 'Giảm theo phần trăm không được vượt quá 100%';
  }
  return null;
};
