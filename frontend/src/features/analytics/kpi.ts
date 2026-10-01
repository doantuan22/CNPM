import { toDateInputValue } from '../../lib/utils';
import type { DateRangeQuery, OwnerAnalytics } from './types';

export interface PeriodRanges {
  current: Required<DateRangeQuery>;
  previous: Required<DateRangeQuery>;
}

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** The last `days` days up to and including `today`, and the `days` days right before them (both ends inclusive, YYYY-MM-DD). */
export function lastDaysRanges(days: number, today: Date = new Date()): PeriodRanges {
  return {
    current: { from: toDateInputValue(addDays(today, -(days - 1))), to: toDateInputValue(today) },
    previous: { from: toDateInputValue(addDays(today, -(2 * days - 1))), to: toDateInputValue(addDays(today, -days)) },
  };
}

export interface Kpis {
  /** Percent of room-nights sold; null when the hotel had no rooms on sale in the period. */
  occupancy: number | null;
  /** Average daily rate: money received per room-night sold. */
  adr: number | null;
  /** Revenue per available room-night. */
  revpar: number | null;
  newBookings: number;
}

/**
 * ADR and RevPAR are estimates: the API reports money actually received (DoanhThuThucNhan, net of refunds)
 * and room-nights, not room revenue by stay date, so they are labelled as such where shown.
 */
export function computeKpis(analytics: OwnerAnalytics): Kpis {
  const { TyLeLapDay, DoanhThuThucNhan, TongPhongDem, TongPhongCoTheBan, TongSoBooking } = analytics;
  return {
    occupancy: TyLeLapDay,
    adr: TongPhongDem > 0 ? DoanhThuThucNhan / TongPhongDem : null,
    revpar: TongPhongCoTheBan > 0 ? DoanhThuThucNhan / TongPhongCoTheBan : null,
    newBookings: TongSoBooking,
  };
}

export interface Change {
  text: string;
  tone: 'good' | 'bad' | 'neutral';
}

const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(Math.abs(value));

/**
 * How `current` moved against `previous`, as text for a KPI card. `percent` compares relatively (+12,5%),
 * `points` is for values that are already percentages (+3,2 điểm %). Higher is better for all of them.
 * Null when there is nothing to compare with.
 */
export function changeVersusPrevious(current: number | null, previous: number | null, kind: 'percent' | 'points', label: string): Change | null {
  if (current === null || previous === null) return null;
  if (kind === 'percent' && previous === 0) return null;
  const delta = kind === 'percent' ? ((current - previous) / previous) * 100 : current - previous;
  const rounded = Math.round(delta * 10) / 10;
  if (rounded === 0) return { text: `Không đổi so với ${label}`, tone: 'neutral' };
  const sign = rounded > 0 ? '+' : '−';
  const unit = kind === 'percent' ? '%' : ' điểm %';
  return { text: `${sign}${formatNumber(rounded)}${unit} so với ${label}`, tone: rounded > 0 ? 'good' : 'bad' };
}
