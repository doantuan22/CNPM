import { Request, Response, NextFunction } from 'express';
import { ProfileService } from './profile.service';
import { sendSuccess } from '../../common/utils/response';
import { AppError } from '../../common/errors/app-error';

export class ProfileController {
  constructor(private readonly profileService: ProfileService = new ProfileService()) {}

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthorized();
      const account = await this.profileService.getMe(req.user.maTaiKhoan);
      sendSuccess(res, account);
    } catch (error) {
      next(error);
    }
  };

  updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthorized();
      const account = await this.profileService.updateMe(req.user.maTaiKhoan, req.body);
      sendSuccess(res, account, 'Cập nhật thông tin cá nhân thành công');
    } catch (error) {
      next(error);
    }
  };
}
