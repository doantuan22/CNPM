import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schemas';

const router = Router();
const controller = new AuthController();

router.post('/register', validateRequest({ body: registerSchema }), controller.register);
router.post('/login', validateRequest({ body: loginSchema }), controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.post(
  '/forgot-password',
  validateRequest({ body: forgotPasswordSchema }),
  controller.forgotPassword
);
router.post(
  '/reset-password',
  validateRequest({ body: resetPasswordSchema }),
  controller.resetPassword
);

export default router;
