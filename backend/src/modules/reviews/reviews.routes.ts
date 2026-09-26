import { Router } from 'express';
import { ReviewsController } from './reviews.controller';
import { authenticate, requireRole, requireAdmin } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { ROLE_NAMES } from '../../common/constants/roles';
import { bookingIdParamSchema, reviewIdParamSchema, createReviewSchema, moderateReviewSchema, adminListReviewsQuerySchema } from './reviews.schemas';

const controller = new ReviewsController();

/** Mounted at `/bookings` — a customer reviewing their own (completed) booking. */
export const reviewsBookingRoutes = Router();

reviewsBookingRoutes.post(
  '/:id/review',
  authenticate,
  requireRole(ROLE_NAMES.CUSTOMER),
  validateRequest({ params: bookingIdParamSchema, body: createReviewSchema }),
  controller.create
);

reviewsBookingRoutes.get(
  '/:id/review',
  authenticate,
  requireRole(ROLE_NAMES.CUSTOMER),
  validateRequest({ params: bookingIdParamSchema }),
  controller.getMine
);

/** Mounted at `/admin/reviews` — moderation only, never reachable by a customer. */
export const adminReviewsRoutes = Router();
adminReviewsRoutes.use(authenticate, requireAdmin);

adminReviewsRoutes.get('/', validateRequest({ query: adminListReviewsQuerySchema }), controller.adminList);
adminReviewsRoutes.get('/:id', validateRequest({ params: reviewIdParamSchema }), controller.adminGetById);
adminReviewsRoutes.patch(
  '/:id/moderate',
  validateRequest({ params: reviewIdParamSchema, body: moderateReviewSchema }),
  controller.moderate
);
