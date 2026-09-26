import { Router } from 'express';
import { OwnerAnalyticsController } from './owner-analytics.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { ROLE_NAMES } from '../../common/constants/roles';
import { hotelIdParamSchema } from './owner-hotels.schemas';
import { dateRangeQuerySchema } from '../analytics/date-range';

/** Mounted at `/owner/hotels` (same prefix as owner-hotels.routes.ts) — one more owner-scoped, ownership-checked action on a hotel. */
const router = Router();
const controller = new OwnerAnalyticsController();

router.get(
  '/:id/analytics',
  authenticate,
  requireRole(ROLE_NAMES.PARTNER),
  validateRequest({ params: hotelIdParamSchema, query: dateRangeQuerySchema }),
  controller.getHotelAnalytics
);

export default router;
