import { Request, Response, NextFunction } from 'express';
import { OwnerRatesService } from './owner-rates.service';
import { sendSuccess } from '../../common/utils/response';
import { AppError } from '../../common/errors/app-error';
import type { ListRatesQuery } from './owner-rates.schemas';

export class OwnerRatesController {
  constructor(private readonly service: OwnerRatesService = new OwnerRatesService()) {}

  private ownerId(req: Request): number {
    if (!req.user) throw AppError.unauthorized();
    return req.user.maTaiKhoan;
  }

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const rates = await this.service.list(this.ownerId(req), id, req.query as unknown as ListRatesQuery);
      sendSuccess(res, rates);
    } catch (error) {
      next(error);
    }
  };

  bulkUpsert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const rates = await this.service.bulkUpsert(this.ownerId(req), id, req.body);
      sendSuccess(res, rates, 'Cập nhật giá/quỹ phòng thành công');
    } catch (error) {
      next(error);
    }
  };
}
