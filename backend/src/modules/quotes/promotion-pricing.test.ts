import { describe, it, expect } from 'vitest';
import { evaluatePromotion, type PromotionRecord } from './promotion-pricing';
import { PROMOTION_STATUS, DISCOUNT_TYPE } from '../../common/constants/commercial';

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);

const basePromo: PromotionRecord = {
  MaKhuyenMai: 1,
  MaCode: 'TEST10',
  LoaiGiamGia: DISCOUNT_TYPE.PERCENT,
  GiaTriGiam: 10,
  GiaTriDonToiThieu: 0,
  MucGiamToiDa: 0,
  SoLuongGioiHan: 0,
  NgayBatDau: d('2026-01-01'),
  NgayKetThuc: d('2026-12-31'),
  TrangThai: PROMOTION_STATUS.ACTIVE,
};

describe('evaluatePromotion', () => {
  it('applies a percentage discount uncapped when MucGiamToiDa = 0', () => {
    const result = evaluatePromotion(basePromo, 1_000_000, d('2026-06-01'), 0);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(100_000); // 10%
  });

  it('caps a percentage discount at MucGiamToiDa when set', () => {
    const promo = { ...basePromo, MucGiamToiDa: 50_000 };
    const result = evaluatePromotion(promo, 1_000_000, d('2026-06-01'), 0);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(50_000); // capped, not 100_000
  });

  it('applies a fixed-amount discount regardless of MucGiamToiDa', () => {
    const promo: PromotionRecord = {
      ...basePromo,
      LoaiGiamGia: DISCOUNT_TYPE.FIXED_AMOUNT,
      GiaTriGiam: 200_000,
      MucGiamToiDa: 50_000, // irrelevant for fixed-amount per Chương 6
    };
    const result = evaluatePromotion(promo, 1_000_000, d('2026-06-01'), 0);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(200_000);
  });

  it('never discounts more than the subtotal', () => {
    const promo: PromotionRecord = { ...basePromo, LoaiGiamGia: DISCOUNT_TYPE.FIXED_AMOUNT, GiaTriGiam: 900_000 };
    const result = evaluatePromotion(promo, 500_000, d('2026-06-01'), 0);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(500_000); // clamped to subtotal
  });

  it('rejects a promotion that has not started yet', () => {
    const promo = { ...basePromo, NgayBatDau: d('2026-07-01') };
    const result = evaluatePromotion(promo, 1_000_000, d('2026-06-01'), 0);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/chưa bắt đầu/i);
    expect(result.discount).toBe(0);
  });

  it('rejects an expired promotion', () => {
    const promo = { ...basePromo, NgayKetThuc: d('2026-05-01') };
    const result = evaluatePromotion(promo, 1_000_000, d('2026-06-01'), 0);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/hết hạn/i);
  });

  it('rejects when the order total is below the minimum', () => {
    const promo = { ...basePromo, GiaTriDonToiThieu: 2_000_000 };
    const result = evaluatePromotion(promo, 1_000_000, d('2026-06-01'), 0);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/giá trị tối thiểu/i);
  });

  it('rejects when the usage limit has been reached', () => {
    const promo = { ...basePromo, SoLuongGioiHan: 5 };
    const result = evaluatePromotion(promo, 1_000_000, d('2026-06-01'), 5);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/hết lượt/i);
  });

  it('allows unlimited usage when SoLuongGioiHan = 0', () => {
    const promo = { ...basePromo, SoLuongGioiHan: 0 };
    const result = evaluatePromotion(promo, 1_000_000, d('2026-06-01'), 9999);
    expect(result.valid).toBe(true);
  });

  it('rejects an inactive promotion regardless of dates', () => {
    const promo = { ...basePromo, TrangThai: 'Hết hạn' };
    const result = evaluatePromotion(promo, 1_000_000, d('2026-06-01'), 0);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/không hoạt động/i);
  });
});
