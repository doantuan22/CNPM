import { Router } from 'express';
import { PartnersController } from './partners.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { applyPartnerSchema } from './partners.schemas';

const router = Router();
const controller = new PartnersController();

router.use(authenticate);
router.post('/apply', validateRequest({ body: applyPartnerSchema }), controller.apply);
router.get('/me', controller.getMine);

export default router;
