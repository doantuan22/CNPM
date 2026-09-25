import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { updateProfileSchema } from './profile.schemas';

const router = Router();
const controller = new ProfileController();

router.get('/me', authenticate, controller.getMe);
router.patch('/me', authenticate, validateRequest({ body: updateProfileSchema }), controller.updateMe);

export default router;
