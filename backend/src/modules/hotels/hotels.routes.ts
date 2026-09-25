import { Router } from 'express';
import { HotelsController } from './hotels.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { searchHotelsQuerySchema, hotelIdParamSchema, hotelRoomsQuerySchema } from './hotels.schemas';

const router = Router();
const controller = new HotelsController();

// All public — no authentication. M2 is read-only discovery (BE-2 + BE-4).
router.get('/', validateRequest({ query: searchHotelsQuerySchema }), controller.search);
router.get('/:id', validateRequest({ params: hotelIdParamSchema }), controller.getDetail);
router.get(
  '/:id/rooms',
  validateRequest({ params: hotelIdParamSchema, query: hotelRoomsQuerySchema }),
  controller.getRooms
);

export default router;
