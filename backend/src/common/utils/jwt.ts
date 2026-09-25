import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';

export interface JwtPayload {
  sub: string; // MaTaiKhoan
  role: string; // VAI_TRO.TenVaiTro
}

interface SignedTokenPayload extends JwtPayload {
  typ: 'access' | 'refresh';
}

export const signAccessToken = (payload: JwtPayload): string => {
  const body: SignedTokenPayload = { ...payload, typ: 'access' };
  return jwt.sign(body, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
};

export const signRefreshToken = (payload: JwtPayload): string => {
  const body: SignedTokenPayload = { ...payload, typ: 'refresh' };
  return jwt.sign(body, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as SignedTokenPayload;
  if (decoded.typ !== 'access') {
    throw new Error('Invalid token type');
  }
  return { sub: decoded.sub, role: decoded.role };
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as SignedTokenPayload;
  if (decoded.typ !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return { sub: decoded.sub, role: decoded.role };
};

export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
export const REFRESH_TOKEN_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
