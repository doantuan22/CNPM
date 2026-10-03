import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { env } from '../../config/env';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwt';
import { matchesPasswordFingerprint, passwordFingerprint } from './password-fingerprint';

describe('JWT hardening', () => {
  const payload = { sub: '123', role: 'Khách hàng' };
  const pwdv = passwordFingerprint('$2b$12$exampleexampleexampleexampleexampleexampleexampleexamp');
  const refreshPayload = { ...payload, pwdv };

  it('separates access and refresh token types/secrets', () => {
    expect(verifyAccessToken(signAccessToken(payload))).toEqual(payload);
    expect(verifyRefreshToken(signRefreshToken(refreshPayload))).toEqual(refreshPayload);
    expect(() => verifyAccessToken(signRefreshToken(refreshPayload))).toThrow();
    expect(() => verifyRefreshToken(signAccessToken(payload))).toThrow();
  });

  it('rejects a correctly signed token with the wrong issuer/audience', () => {
    const wrongClaims = jwt.sign({ ...payload, typ: 'access' }, env.JWT_ACCESS_SECRET, {
      algorithm: 'HS256', expiresIn: '15m', issuer: 'other-service', audience: 'other-client',
    });
    expect(() => verifyAccessToken(wrongClaims)).toThrow();
  });

  it('rejects malformed account subjects', () => {
    const malformed = jwt.sign({ sub: 'not-an-id', role: payload.role, typ: 'access' }, env.JWT_ACCESS_SECRET, {
      algorithm: 'HS256', expiresIn: '15m', issuer: 'hotel-booking-api', audience: 'hotel-booking-web',
    });
    expect(() => verifyAccessToken(malformed)).toThrow();
  });
});

describe('refresh token password fingerprint (BUG-012)', () => {
  const HASH = '$2b$12$abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUVWXYZ0123456';
  const sign = (extra: Record<string, unknown>) =>
    jwt.sign({ sub: '123', role: 'Khách hàng', typ: 'refresh', ...extra }, env.JWT_REFRESH_SECRET, {
      algorithm: 'HS256', expiresIn: '7d', issuer: 'hotel-booking-api', audience: 'hotel-booking-web',
    });

  it('carries only the derived fingerprint, never the password hash', () => {
    const token = signRefreshToken({ sub: '123', role: 'Khách hàng', pwdv: passwordFingerprint(HASH) });
    const decoded = jwt.decode(token) as Record<string, unknown>;

    expect(decoded.pwdv).toMatch(/^[a-f0-9]{32}$/);
    expect(JSON.stringify(decoded)).not.toContain(HASH);
  });

  it('does not put the fingerprint into access tokens', () => {
    expect(jwt.decode(signAccessToken({ sub: '123', role: 'Khách hàng' }))).not.toHaveProperty('pwdv');
  });

  it.each([
    ['missing (a token issued before BUG-012)', {}],
    ['not a string', { pwdv: 12345 }],
    ['malformed', { pwdv: 'not-a-fingerprint' }],
    ['the raw bcrypt hash', { pwdv: HASH }],
  ])('refuses a refresh token whose fingerprint is %s', (_label, extra) => {
    expect(() => verifyRefreshToken(sign(extra))).toThrow();
  });

  it('matches only the hash it was derived from', () => {
    const fp = passwordFingerprint('hash-one');
    expect(matchesPasswordFingerprint(fp, 'hash-one')).toBe(true);
    expect(matchesPasswordFingerprint(fp, 'hash-two')).toBe(false);
    expect(matchesPasswordFingerprint('short', 'hash-one')).toBe(false);
  });
});
