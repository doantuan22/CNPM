import { Request, Response, NextFunction } from 'express';
import { PromotionsService } from './promotions.service';
import { sendSuccess, sendPaginated } from '../../common/utils/response';
import type { CreatePromotionInput, ListPromotionsQuery, UpdatePromotionInput } from './promotions.schemas';

export class PromotionsController {
  constructor(private readonly service: PromotionsService = new PromotionsService()) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { items, pagination } = await this.service.list(req.query as unknown as ListPromotionsQuery);
      sendPaginated(res, items, pagination);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const promo = await this.service.getById(id);
      sendSuccess(res, promo);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const promo = await this.service.create(req.body as CreatePromotionInput);
      sendSuccess(res, promo, 'Tạo mã khuyến mãi thành công', 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const promo = await this.service.update(id, req.body as UpdatePromotionInput);
      sendSuccess(res, promo, 'Cập nhật mã khuyến mãi thành công');
    } catch (error) {
      next(error);
    }
  };

  activate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const promo = await this.service.activate(id);
      sendSuccess(res, promo, 'Đã bật mã khuyến mãi');
    } catch (error) {
      next(error);
    }
  };

  deactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const promo = await this.service.deactivate(id);
      sendSuccess(res, promo, 'Đã tắt mã khuyến mãi');
    } catch (error) {
      next(error);
    }
  };
}
