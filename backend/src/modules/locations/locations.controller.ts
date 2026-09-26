import { Request, Response, NextFunction } from 'express';
import { LocationsRepository } from './locations.repository';
import { sendSuccess } from '../../common/utils/response';

export class LocationsController {
  constructor(private readonly repository: LocationsRepository = new LocationsRepository()) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const locations = await this.repository.findAll();
      sendSuccess(res, locations);
    } catch (error) {
      next(error);
    }
  };
}
