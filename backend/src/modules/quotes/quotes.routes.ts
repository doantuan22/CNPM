import { Router } from 'express';
import { QuotesController } from './quotes.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { quoteRequestSchema, hotelIdParamSchema } from './quotes.schemas';

const router = Router();
const controller = new QuotesController();

// Public, read-only computation — no booking is created (M4 §3/§4).
router.post(
  '/:id/quote',
  validateRequest({ params: hotelIdParamSchema, body: quoteRequestSchema }),
  controller.create
);

export default router;
