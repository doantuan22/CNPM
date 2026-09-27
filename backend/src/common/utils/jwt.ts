import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const JWT_ISSUER = 'hotel-booking-api';
const JWT_AUDIENCE = 'hotel-booking-web';
const JWT_ALGORITHM = 'HS256' as const;

export interface JwtPayload {
  sub: string; // MaTaiKhoan
  role: string; // VAI_TRO.TenVaiTro
}

interface SignedTokenPayload extends JwtPayload {
  typ: 'access' | 'refresh';
}

export const signAccessToken = (payload: JwtPayload): string => {
  const body: SignedTokenPayload = { ...payload, typ: 'access' };
  return jwt.sign(body, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
    algorithm: JWT_ALGORITHM,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
};

export const signRefreshToken = (payload: JwtPayload): string => {
  const body: SignedTokenPayload = { ...payload, typ: 'refresh' };
  return jwt.sign(body, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
    algorithm: JWT_ALGORITHM,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
};

const assertPayload = (decoded: SignedTokenPayload, expectedType: SignedTokenPayload['typ']): JwtPayload => {
  const accountId = Number(decoded.sub);
  if (decoded.typ !== expectedType || !Number.isSafeInteger(accountId) || accountId <= 0 || typeof decoded.role !== 'string' || !decoded.role) {
    throw new Error('Invalid token payload');
  }
  return { sub: String(accountId), role: decoded.role };
};

export const verifyAccessToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    algorithms: [JWT_ALGORITHM], issuer: JWT_ISSUER, audience: JWT_AUDIENCE,
  }) as SignedTokenPayload;
  return assertPayload(decoded, 'access');
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
    algorithms: [JWT_ALGORITHM], issuer: JWT_ISSUER, audience: JWT_AUDIENCE,
  }) as SignedTokenPayload;
  return assertPayload(decoded, 'refresh');
};

export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
export const REFRESH_TOKEN_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
