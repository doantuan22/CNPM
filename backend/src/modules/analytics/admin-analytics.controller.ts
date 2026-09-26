import { Request, Response, NextFunction } from 'express';
import { AdminAnalyticsService } from './admin-analytics.service';
import { sendSuccess } from '../../common/utils/response';
import type { DateRangeQuery } from './date-range';

export class AdminAnalyticsController {
  constructor(private readonly service: AdminAnalyticsService = new AdminAnalyticsService()) {}

  getSystemAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const analytics = await this.service.getSystemAnalytics(req.query as unknown as DateRangeQuery);
      sendSuccess(res, analytics);
    } catch (error) {
      next(error);
    }
  };
}
