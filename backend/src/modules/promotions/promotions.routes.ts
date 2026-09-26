import { Router } from 'express';
import { PromotionsController } from './promotions.controller';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import {
  promotionIdParamSchema,
  createPromotionSchema,
  updatePromotionSchema,
  listPromotionsQuerySchema,
} from './promotions.schemas';

const router = Router();
const controller = new PromotionsController();

router.use(authenticate, requireAdmin);

router.get('/', validateRequest({ query: listPromotionsQuerySchema }), controller.list);
router.post('/', validateRequest({ body: createPromotionSchema }), controller.create);
router.get('/:id', validateRequest({ params: promotionIdParamSchema }), controller.getById);
router.patch(
  '/:id',
  validateRequest({ params: promotionIdParamSchema, body: updatePromotionSchema }),
  controller.update
);
router.post('/:id/activate', validateRequest({ params: promotionIdParamSchema }), controller.activate);
router.post('/:id/deactivate', validateRequest({ params: promotionIdParamSchema }), controller.deactivate);

export default router;
