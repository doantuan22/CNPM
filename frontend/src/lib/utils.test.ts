import { describe, expect, it } from 'vitest';
import { formatCountdown, formatDateRangeVi, formatDateTimeVi, formatDateVi } from './utils';

describe('formatDateVi', () => {
  it('formats a date-only API value as dd/mm/yyyy without any timezone shift', () => {
    expect(formatDateVi('2026-10-05')).toBe('05/10/2026');
    expect(formatDateVi('2030-01-01')).toBe('01/01/2030');
  });

  it('returns the input unchanged when it is not a date', () => {
    expect(formatDateVi('not a date')).toBe('not a date');
    expect(formatDateVi('')).toBe('');
  });
});

describe('formatDateTimeVi', () => {
  it('formats a timestamp with the year and a time of day', () => {
    const text = formatDateTimeVi('2026-09-27T12:34:56.492Z');
    expect(text).toMatch(/2026/);
    expect(text).toMatch(/\d{1,2}:\d{2}/);
  });

  it('returns the input unchanged when it is not a timestamp', () => {
    expect(formatDateTimeVi('nope')).toBe('nope');
  });
});

describe('formatDateRangeVi', () => {
  it('joins two formatted dates with the given separator', () => {
    expect(formatDateRangeVi('2026-10-05', '2026-10-06')).toBe('05/10/2026 – 06/10/2026');
    expect(formatDateRangeVi('2026-10-05', '2026-10-06', ' → ')).toBe('05/10/2026 → 06/10/2026');
  });
});

describe('formatCountdown', () => {
  it.each([
    [0, '00:00'],
    [5, '00:05'],
    [65, '01:05'],
    [900, '15:00'],
    [3599, '59:59'],
    [3600, '1:00:00'],
    [3725, '1:02:05'],
  ])('%i seconds -> %s', (seconds, text) => {
    expect(formatCountdown(seconds)).toBe(text);
  });

  it('never shows a negative time', () => {
    expect(formatCountdown(-3)).toBe('00:00');
  });
});
