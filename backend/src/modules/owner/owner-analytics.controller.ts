import { Request, Response, NextFunction } from 'express';
import { OwnerAnalyticsService } from './owner-analytics.service';
import { sendSuccess } from '../../common/utils/response';
import type { DateRangeQuery } from '../analytics/date-range';

export class OwnerAnalyticsController {
  constructor(private readonly service: OwnerAnalyticsService = new OwnerAnalyticsService()) {}

  getHotelAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const analytics = await this.service.getHotelAnalytics(req.user!.maTaiKhoan, id, req.query as unknown as DateRangeQuery);
      sendSuccess(res, analytics);
    } catch (error) {
      next(error);
    }
  };
}
