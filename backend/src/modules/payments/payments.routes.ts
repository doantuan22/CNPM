import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { ROLE_NAMES } from '../../common/constants/roles';
import { bookingIdParamSchema, refundIdParamSchema } from './payments.schemas';

const controller = new PaymentsController();

/** Mounted at `/bookings` — payment actions on one's own booking (M6 §1). */
export const paymentsBookingRoutes = Router();

paymentsBookingRoutes.post(
  '/:id/payments/vnpay',
  authenticate,
  requireRole(ROLE_NAMES.CUSTOMER),
  validateRequest({ params: bookingIdParamSchema }),
  controller.createVnpayPayment
);

paymentsBookingRoutes.get(
  '/:id/payments/status',
  authenticate,
  requireRole(ROLE_NAMES.CUSTOMER),
  validateRequest({ params: bookingIdParamSchema }),
  controller.getStatus
);

/** Mounted at `/payments` — VNPAY-facing gateway endpoints. No auth: the caller is VNPAY's browser redirect / server, authenticated instead by vnp_SecureHash (verified inside the service). */
export const paymentsGatewayRoutes = Router();

paymentsGatewayRoutes.get('/vnpay-return', controller.vnpayReturn);
paymentsGatewayRoutes.get('/vnpay-ipn', controller.vnpayIpn);

/** Mounted at `/payments` — customer-triggered refund retry. */
paymentsGatewayRoutes.post(
  '/refunds/:id/retry',
  authenticate,
  requireRole(ROLE_NAMES.CUSTOMER),
  validateRequest({ params: refundIdParamSchema }),
  controller.retryRefund
);
