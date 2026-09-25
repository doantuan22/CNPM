import { Request, Response, NextFunction } from 'express';
import { HealthService } from './health.service';
import { sendSuccess } from '../../common/utils/response';

export class HealthController {
  constructor(private readonly healthService: HealthService = new HealthService()) {}

  getHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const checkDb = req.query.db === 'true';
      const healthData = await this.healthService.getHealthStatus(checkDb);

      sendSuccess(res, healthData, 'Hotel Booking API is running');
    } catch (error) {
      next(error);
    }
  };
}
