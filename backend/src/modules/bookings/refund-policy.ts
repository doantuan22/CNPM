/**
 * Pure cancellation-tier selection (M6 §3, read-only). Mirrors priceRoomLine
 * in hotels/availability.ts: a small pure function shared by the backend
 * (authoritative) and, as an equivalent hand-written copy, the frontend
 * preview (frontend/src/features/bookings/refund-preview.ts) — see M6
 * report for why the preview is a separate, non-authoritative copy.
 *
 * CHI_TIET_CHINH_SACH_HUY rows read as "cancel at least SoGioTruocNhanPhong
 * hours before check-in → refund TyLeHoanTien% of the amount paid". The
 * applicable tier is the one with the LARGEST threshold that is still
 * satisfied (the most generous tier the customer still qualifies for). If
 * no threshold is satisfied (cancelling too close to, or after, check-in),
 * the refund is 0%.
 */
export interface CancellationTier {
  soGioTruocNhanPhong: number;
  tyLeHoanTien: number;
}

/** hoursBeforeCheckIn may be negative (cancelling after check-in already started) — always resolves to 0% then. */
export const selectRefundPercent = (tiers: readonly CancellationTier[], hoursBeforeCheckIn: number): number => {
  const eligible = tiers.filter((t) => hoursBeforeCheckIn >= t.soGioTruocNhanPhong);
  if (eligible.length === 0) return 0;
  return eligible.reduce((best, t) => (t.soGioTruocNhanPhong > best.soGioTruocNhanPhong ? t : best), eligible[0])
    .tyLeHoanTien;
};

/**
 * Rounds to the nearest đồng (priceRoomLine's rounding convention) and
 * clamps to amountPaid — a refund must never exceed what was actually
 * paid, even if refundPercent were ever miscomputed above 100 (M6 §4).
 */
export const computeRefundAmount = (amountPaid: number, refundPercent: number): number =>
  Math.min(Math.round((amountPaid * refundPercent) / 100), amountPaid);
