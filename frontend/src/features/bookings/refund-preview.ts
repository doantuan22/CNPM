/**
 * Preview-only mirror of backend/src/modules/bookings/refund-policy.ts —
 * lets the Cancel dialog show an estimated refund BEFORE the customer
 * confirms, without a round trip. The backend recomputes this exact same
 * logic independently at cancel time and is always the authoritative
 * source of the final amount (this file must never be the thing that
 * decides money) — see M6 report §5.
 */
export interface CancellationTier {
  SoGioTruocNhanPhong: number;
  TyLeHoanTien: number;
}

export const selectRefundPercentPreview = (tiers: readonly CancellationTier[], hoursBeforeCheckIn: number): number => {
  const eligible = tiers.filter((t) => hoursBeforeCheckIn >= t.SoGioTruocNhanPhong);
  if (eligible.length === 0) return 0;
  return eligible.reduce((best, t) => (t.SoGioTruocNhanPhong > best.SoGioTruocNhanPhong ? t : best), eligible[0])
    .TyLeHoanTien;
};

export const computeRefundAmountPreview = (amountPaid: number, refundPercent: number): number =>
  Math.min(Math.round((amountPaid * refundPercent) / 100), amountPaid);

/** Same reference instant as the backend: check-in midnight (NgayNhanPhong has no time-of-day — it's a SQL DATE column). */
export const hoursBeforeCheckIn = (ngayNhanPhongIso: string, now: Date = new Date()): number => {
  const checkIn = new Date(`${ngayNhanPhongIso}T00:00:00.000Z`);
  return (checkIn.getTime() - now.getTime()) / 3_600_000;
};
