import { createHash, timingSafeEqual } from 'crypto';

/**
 * A short value derived from an account's CURRENT password hash. Tokens carry it
 * instead of any session row, so changing the password (new bcrypt hash, new
 * salt) makes every token minted before the change stop matching.
 *
 * Only this one-way digest ever goes into a JWT — never the bcrypt hash itself.
 */
export const FINGERPRINT_PATTERN = /^[a-f0-9]{32}$/;

export const passwordFingerprint = (passwordHash: string): string =>
  createHash('sha256').update(passwordHash).digest('hex').slice(0, 32);

/** Constant-time comparison of a token's fingerprint with the one for the stored hash. */
export const matchesPasswordFingerprint = (fp: string, currentPasswordHash: string): boolean => {
  const presented = Buffer.from(fp);
  const expected = Buffer.from(passwordFingerprint(currentPasswordHash));
  return presented.length === expected.length && timingSafeEqual(presented, expected);
};
