import { Request, Response, NextFunction } from 'express';
import { SupportService } from './support.service';
import { sendSuccess, sendPaginated } from '../../common/utils/response';
import type { AdminListSupportQuery, AdminUpdateSupportInput, CreateSupportInput } from './support.schemas';

export class SupportController {
  constructor(private readonly service: SupportService = new SupportService()) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const request = await this.service.create(req.user!.maTaiKhoan, req.body as CreateSupportInput);
      sendSuccess(res, request, 'Gửi yêu cầu hỗ trợ thành công', 201);
    } catch (error) {
      next(error);
    }
  };

  listMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requests = await this.service.listMine(req.user!.maTaiKhoan);
      sendSuccess(res, requests);
    } catch (error) {
      next(error);
    }
  };

  getMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const request = await this.service.getMine(id, req.user!.maTaiKhoan);
      sendSuccess(res, request);
    } catch (error) {
      next(error);
    }
  };

  adminList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { items, pagination } = await this.service.adminList(req.query as unknown as AdminListSupportQuery);
      sendPaginated(res, items, pagination);
    } catch (error) {
      next(error);
    }
  };

  adminGetById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const request = await this.service.adminGetById(id);
      sendSuccess(res, request);
    } catch (error) {
      next(error);
    }
  };

  adminUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const request = await this.service.adminUpdate(id, req.user!.maTaiKhoan, req.body as AdminUpdateSupportInput);
      sendSuccess(res, request, 'Cập nhật yêu cầu hỗ trợ thành công');
    } catch (error) {
      next(error);
    }
  };
}
