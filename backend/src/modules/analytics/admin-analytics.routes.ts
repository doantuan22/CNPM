import { Router } from 'express';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { dateRangeQuerySchema } from './date-range';

const router = Router();
const controller = new AdminAnalyticsController();

router.get('/', authenticate, requireAdmin, validateRequest({ query: dateRangeQuerySchema }), controller.getSystemAnalytics);

export default router;
