import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../common/errors/app-error';
import { sendPaginated, sendSuccess } from '../../common/utils/response';
import { OwnerBookingsService } from './owner-bookings.service';
import type { OwnerBookingsQuery } from './owner-bookings.schemas';

export class OwnerBookingsController {
  constructor(private readonly service: OwnerBookingsService = new OwnerBookingsService()) {}
  private ownerId(req: Request) { if (!req.user) throw AppError.unauthorized(); return req.user.maTaiKhoan; }
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { const { hotelId } = req.params as unknown as { hotelId: number }; const result = await this.service.list(this.ownerId(req), hotelId, req.query as unknown as OwnerBookingsQuery); sendPaginated(res, result.items, result.pagination); } catch (error) { next(error); } };
  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { const { hotelId, bookingId } = req.params as unknown as { hotelId: number; bookingId: number }; sendSuccess(res, await this.service.getOne(this.ownerId(req), hotelId, bookingId)); } catch (error) { next(error); } };
}
