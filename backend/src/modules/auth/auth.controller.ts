import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthResult } from './auth.service';
import { sendSuccess } from '../../common/utils/response';
import { AppError } from '../../common/errors/app-error';
import { env } from '../../config/env';
import {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
} from '../../common/utils/jwt';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth',
  maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
};

export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  private sendAuthResult = (res: Response, result: AuthResult, message: string, statusCode = 200) => {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    sendSuccess(
      res,
      { account: result.account, accessToken: result.tokens.accessToken },
      message,
      statusCode
    );
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      this.sendAuthResult(res, result, 'Đăng ký tài khoản thành công', 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      this.sendAuthResult(res, result, 'Đăng nhập thành công');
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
      if (!refreshToken) {
        throw AppError.unauthorized('Không tìm thấy refresh token');
      }
      const tokens = await this.authService.refresh(refreshToken);
      res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
      sendSuccess(res, { accessToken: tokens.accessToken }, 'Làm mới token thành công');
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    // No REFRESH_TOKEN table exists (Gate 0) — logout is stateless: clearing
    // the httpOnly cookie is the whole strategy. The token itself remains
    // cryptographically valid until it naturally expires (<=7 days).
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/api/auth' });
    sendSuccess(res, undefined, 'Đăng xuất thành công');
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.forgotPassword(req.body);
      sendSuccess(
        res,
        undefined,
        'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi'
      );
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.resetPassword(req.body);
      sendSuccess(res, undefined, 'Đặt lại mật khẩu thành công');
    } catch (error) {
      next(error);
    }
  };
}
