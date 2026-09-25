import { Request, Response, NextFunction } from 'express';
import { PartnersService } from './partners.service';
import { sendSuccess } from '../../common/utils/response';
import { AppError } from '../../common/errors/app-error';

export class PartnersController {
  constructor(private readonly partnersService: PartnersService = new PartnersService()) {}

  apply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthorized();
      const application = await this.partnersService.apply(req.user.maTaiKhoan, req.body);
      sendSuccess(res, application, 'Nộp hồ sơ đăng ký đối tác thành công', 201);
    } catch (error) {
      next(error);
    }
  };

  getMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthorized();
      const application = await this.partnersService.getMyApplication(req.user.maTaiKhoan);
      sendSuccess(res, application);
    } catch (error) {
      next(error);
    }
  };
}
