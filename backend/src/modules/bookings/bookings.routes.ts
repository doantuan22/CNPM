import { Router } from 'express';
import { BookingsController } from './bookings.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { ROLE_NAMES } from '../../common/constants/roles';
import { createBookingSchema, hotelIdParamSchema } from './bookings.schemas';

const router = Router();
const controller = new BookingsController();

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
