import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { env } from '../../config/env';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwt';

describe('JWT hardening', () => {
  const payload = { sub: '123', role: 'Khách hàng' };

  it('separates access and refresh token types/secrets', () => {
    expect(verifyAccessToken(signAccessToken(payload))).toEqual(payload);
    expect(verifyRefreshToken(signRefreshToken(payload))).toEqual(payload);
    expect(() => verifyAccessToken(signRefreshToken(payload))).toThrow();
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
