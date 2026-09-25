import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../common/utils/jwt';
import { AppError } from '../common/errors/app-error';
import { ROLE_NAMES } from '../common/constants/roles';

export interface AuthenticatedUser {
  maTaiKhoan: number;
  role: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const extractBearerToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
};

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractBearerToken(req);
  if (!token) {
    next(AppError.unauthorized('Missing or invalid Authorization header'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { maTaiKhoan: Number(payload.sub), role: payload.role };
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired access token'));
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized('Authentication required'));
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(AppError.forbidden('You do not have permission to perform this action'));
      return;
    }
    next();
  };
};

export const requireAdmin = requireRole(ROLE_NAMES.ADMIN);
