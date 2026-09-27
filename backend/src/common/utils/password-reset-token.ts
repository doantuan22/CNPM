import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { env } from '../../config/env';

export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 15;
const RESET_TOKEN_TTL = `${PASSWORD_RESET_TOKEN_TTL_MINUTES}m`;
const RESET_TOKEN_ISSUER = 'hotel-booking-api';
const RESET_TOKEN_AUDIENCE = 'hotel-booking-password-reset';

interface ResetTokenPayload {
  sub: string; // MaTaiKhoan
  typ: 'pwd_reset';
  fp: string; // fingerprint derived from the current password hash
}

/**
 * Stateless password-reset token: no REFRESH_TOKEN/RESET_TOKEN table exists
 * (Gate 0 / M1 forbid adding one without a Change Gate), so the token embeds
 * a fingerprint of the account's CURRENT password hash. Once the password is
 * changed (by this reset or any other means), the fingerprint no longer
 * matches and the token is rejected — giving effectively single-use,
 * self-expiring tokens without any new persistence.
 */
const fingerprint = (passwordHash: string): string =>
  createHash('sha256').update(passwordHash).digest('hex').slice(0, 32);

export const signPasswordResetToken = (maTaiKhoan: number, currentPasswordHash: string): string => {
  const payload: ResetTokenPayload = {
    sub: String(maTaiKhoan),
    typ: 'pwd_reset',
    fp: fingerprint(currentPasswordHash),
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: RESET_TOKEN_TTL,
    algorithm: 'HS256',
    issuer: RESET_TOKEN_ISSUER,
    audience: RESET_TOKEN_AUDIENCE,
  });
};

/**
 * Verifies signature + expiry only (does not require knowing the account's
 * current password hash yet). Throws if the token is malformed, expired, or
 * not a password-reset token.
 */
export const decodePasswordResetToken = (token: string): { maTaiKhoan: number; fp: string } => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    algorithms: ['HS256'], issuer: RESET_TOKEN_ISSUER, audience: RESET_TOKEN_AUDIENCE,
  }) as ResetTokenPayload;
  const accountId = Number(decoded.sub);
  if (decoded.typ !== 'pwd_reset' || !Number.isSafeInteger(accountId) || accountId <= 0 || !/^[a-f0-9]{32}$/.test(decoded.fp)) {
    throw new Error('Invalid token type');
  }
  return { maTaiKhoan: accountId, fp: decoded.fp };
};

/** Must be called after decodePasswordResetToken() to confirm the token is still current. */
export const matchesPasswordFingerprint = (fp: string, currentPasswordHash: string): boolean =>
  fp === fingerprint(currentPasswordHash);
