import { Request, Response, NextFunction } from 'express';
import { BookingsService } from './bookings.service';
import { sendSuccess } from '../../common/utils/response';
import type { CreateBookingInput, CancelBookingInput } from './bookings.schemas';

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

  listMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bookings = await this.service.listMyBookings(req.user!.maTaiKhoan);
      sendSuccess(res, bookings);
    } catch (error) {
      next(error);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const booking = await this.service.getBookingDetail(id, req.user!.maTaiKhoan);
      sendSuccess(res, booking);
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as { id: number };
      const booking = await this.service.cancelBooking(id, req.user!.maTaiKhoan, req.body as CancelBookingInput, req.ip ?? '127.0.0.1');
      sendSuccess(res, booking);
    } catch (error) {
      next(error);
    }
  };
}
