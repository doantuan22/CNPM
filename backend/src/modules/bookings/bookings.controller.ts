import { Request, Response, NextFunction } from 'express';
import { BookingsService } from './bookings.service';
import { sendSuccess } from '../../common/utils/response';
import type { CreateBookingInput } from './bookings.schemas';

export class BookingsController {
  constructor(private readonly service: BookingsService = new BookingsService()) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const booking = await this.service.createBooking(id, req.user!.maTaiKhoan, req.body as CreateBookingInput);
      sendSuccess(res, booking, undefined, 201);
    } catch (error) {
      next(error);
    }
  };
}
