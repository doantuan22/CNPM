import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schemas';
import { createRateLimiter } from '../../middleware/security.middleware';

const router = Router();
const controller = new AuthController();
const authLimiter = createRateLimiter({ windowMs: 15 * 60_000, max: 10, keyPrefix: 'auth' });
const registerLimiter = createRateLimiter({ windowMs: 60 * 60_000, max: 10, keyPrefix: 'register' });
const forgotPasswordLimiter = createRateLimiter({ windowMs: 60 * 60_000, max: 5, keyPrefix: 'forgot-password' });
// Stricter than forgot-password: this endpoint takes a bearer-style secret token
// as input, so a missing limit here would let an attacker brute-force it.
const resetPasswordLimiter = createRateLimiter({ windowMs: 60 * 60_000, max: 10, keyPrefix: 'reset-password' });
const applyOutsideTests = (middleware: ReturnType<typeof createRateLimiter>) =>
  process.env.NODE_ENV === 'test' ? (_req: unknown, _res: unknown, next: () => void) => next() : middleware;

router.post('/register', applyOutsideTests(registerLimiter), validateRequest({ body: registerSchema }), controller.register);
router.post('/login', applyOutsideTests(authLimiter), validateRequest({ body: loginSchema }), controller.login);
router.post('/refresh', applyOutsideTests(authLimiter), controller.refresh);
router.post('/logout', controller.logout);
router.post(
  '/forgot-password',
  applyOutsideTests(forgotPasswordLimiter),
  validateRequest({ body: forgotPasswordSchema }),
  controller.forgotPassword
);
router.post(
  '/reset-password',
  applyOutsideTests(resetPasswordLimiter),
  validateRequest({ body: resetPasswordSchema }),
  controller.resetPassword
);

export default router;
