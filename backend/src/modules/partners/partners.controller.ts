import { Request, Response, NextFunction } from 'express';
import { PartnersService } from './partners.service';
import { sendSuccess } from '../../common/utils/response';
import { AppError } from '../../common/errors/app-error';
import type { AdminListPartnerApplicationsQuery } from './partners.schemas';
import { sendPaginated } from '../../common/utils/response';

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

  adminList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.partnersService.adminList(req.query as unknown as AdminListPartnerApplicationsQuery);
      sendPaginated(res, result.items, result.pagination);
    } catch (error) { next(error); }
  };

  adminGetById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      sendSuccess(res, await this.partnersService.adminGetById(id));
    } catch (error) { next(error); }
  };

  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthorized();
      const { id } = req.params as unknown as { id: number };
      sendSuccess(res, await this.partnersService.approve(id, req.user.maTaiKhoan), 'Đã duyệt hồ sơ đối tác');
    } catch (error) { next(error); }
  };

  reject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthorized();
      const { id } = req.params as unknown as { id: number };
      sendSuccess(res, await this.partnersService.reject(id, req.user.maTaiKhoan, req.body), 'Đã từ chối hồ sơ đối tác');
    } catch (error) { next(error); }
  };
}
