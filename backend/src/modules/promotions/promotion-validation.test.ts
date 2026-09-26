import { describe, it, expect } from 'vitest';
import { validatePromotionFields } from './promotion-validation';
import { DISCOUNT_TYPE } from '../../common/constants/commercial';

describe('validatePromotionFields', () => {
  it('accepts a valid percent promotion', () => {
    expect(
      validatePromotionFields({
        LoaiGiamGia: DISCOUNT_TYPE.PERCENT,
        GiaTriGiam: 10,
        NgayBatDau: new Date('2026-01-01'),
        NgayKetThuc: new Date('2026-01-31'),
      })
    ).toBeNull();
  });

  it('accepts NgayKetThuc === NgayBatDau (inclusive)', () => {
    expect(
      validatePromotionFields({
        LoaiGiamGia: DISCOUNT_TYPE.FIXED_AMOUNT,
        GiaTriGiam: 50000,
        NgayBatDau: new Date('2026-01-01'),
        NgayKetThuc: new Date('2026-01-01'),
      })
    ).toBeNull();
  });

  it('rejects NgayKetThuc before NgayBatDau', () => {
    expect(
      validatePromotionFields({
        LoaiGiamGia: DISCOUNT_TYPE.FIXED_AMOUNT,
        GiaTriGiam: 50000,
        NgayBatDau: new Date('2026-01-31'),
        NgayKetThuc: new Date('2026-01-01'),
      })
    ).toMatch(/ngày kết thúc/i);
  });

  it('rejects a percent discount above 100', () => {
    expect(
      validatePromotionFields({
        LoaiGiamGia: DISCOUNT_TYPE.PERCENT,
        GiaTriGiam: 101,
        NgayBatDau: new Date('2026-01-01'),
        NgayKetThuc: new Date('2026-01-31'),
      })
    ).toMatch(/100%/);
  });

  it('accepts a percent discount of exactly 100', () => {
    expect(
      validatePromotionFields({
        LoaiGiamGia: DISCOUNT_TYPE.PERCENT,
        GiaTriGiam: 100,
        NgayBatDau: new Date('2026-01-01'),
        NgayKetThuc: new Date('2026-01-31'),
      })
    ).toBeNull();
  });

  it('does not cap a fixed-amount discount at 100', () => {
    expect(
      validatePromotionFields({
        LoaiGiamGia: DISCOUNT_TYPE.FIXED_AMOUNT,
        GiaTriGiam: 500000,
        NgayBatDau: new Date('2026-01-01'),
        NgayKetThuc: new Date('2026-01-31'),
      })
    ).toBeNull();
  });
});
