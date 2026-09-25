import { Request, Response, NextFunction } from 'express';
import { AmenitiesRepository } from './amenities.repository';
import { sendSuccess } from '../../common/utils/response';

export class AmenitiesController {
  constructor(private readonly amenitiesRepository: AmenitiesRepository = new AmenitiesRepository()) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const amenities = await this.amenitiesRepository.findAll();
      sendSuccess(res, amenities);
    } catch (error) {
      next(error);
    }
  };
}
