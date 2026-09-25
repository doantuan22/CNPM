import { Request, Response, NextFunction } from 'express';
import { HotelsService } from './hotels.service';
import { sendSuccess, sendPaginated } from '../../common/utils/response';
import type { SearchHotelsQuery, HotelRoomsQuery } from './hotels.schemas';

export class HotelsController {
  constructor(private readonly hotelsService: HotelsService = new HotelsService()) {}

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { items, pagination } = await this.hotelsService.search(
        req.query as unknown as SearchHotelsQuery
      );
      sendPaginated(res, items, pagination);
    } catch (error) {
      next(error);
    }
  };

  getDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const hotel = await this.hotelsService.getDetail(id);
      sendSuccess(res, hotel);
    } catch (error) {
      next(error);
    }
  };

  getRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const rooms = await this.hotelsService.getRooms(id, req.query as unknown as HotelRoomsQuery);
      sendSuccess(res, rooms);
    } catch (error) {
      next(error);
    }
  };
}
