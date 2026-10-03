import { describe, expect, it } from 'vitest';
import { DEFAULT_GUESTS, parseGuests } from './schemas';

describe('parseGuests', () => {
  it('defaults to the same guest count the home search box shows', () => {
    expect(DEFAULT_GUESTS).toBe(2);
    expect(parseGuests(null)).toBe(DEFAULT_GUESTS);
  });

  it.each([['1', 1], ['3', 3], ['50', 50]])('reads %s from the URL', (raw, expected) => {
    expect(parseGuests(raw)).toBe(expected);
  });

  it.each(['', '0', '-2', 'abc', '2.5'])('falls back to the default for the invalid value "%s"', (raw) => {
    expect(parseGuests(raw)).toBe(DEFAULT_GUESTS);
  });
});
