import { Router } from 'express';
import { BookingsController } from './bookings.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { ROLE_NAMES } from '../../common/constants/roles';
import { createBookingSchema, hotelIdParamSchema, bookingIdParamSchema, cancelBookingSchema } from './bookings.schemas';

const controller = new BookingsController();

const router = Router();

// Only signed-in customers create bookings — everything is recomputed
// server-side inside a locked transaction (M5 §1/§2), never trusting quote.
router.post(
  '/:id/bookings',
  authenticate,
  requireRole(ROLE_NAMES.CUSTOMER),
  validateRequest({ params: hotelIdParamSchema, body: createBookingSchema }),
  controller.create
);

export default router;

/** Self-service booking endpoints (M6) — mounted at `/bookings`, not hotel-scoped like the router above. Ownership is always re-checked server-side, never trusted from the URL alone. */
export const myBookingsRoutes = Router();

myBookingsRoutes.get('/', authenticate, requireRole(ROLE_NAMES.CUSTOMER), controller.listMine);

myBookingsRoutes.get(
  '/:id',
  authenticate,
  requireRole(ROLE_NAMES.CUSTOMER),
  validateRequest({ params: bookingIdParamSchema }),
  controller.getOne
);

myBookingsRoutes.post(
  '/:id/cancel',
  authenticate,
  requireRole(ROLE_NAMES.CUSTOMER),
  validateRequest({ params: bookingIdParamSchema, body: cancelBookingSchema }),
  controller.cancel
);
