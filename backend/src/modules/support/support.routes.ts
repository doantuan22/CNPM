import { Router } from 'express';
import { SupportController } from './support.controller';
import { authenticate, requireRole, requireAdmin } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { ROLE_NAMES } from '../../common/constants/roles';
import { supportIdParamSchema, createSupportSchema, adminUpdateSupportSchema, adminListSupportQuerySchema } from './support.schemas';

const controller = new SupportController();

/** Mounted at `/support` — a customer's own requests only. */
export const supportRoutes = Router();

supportRoutes.post('/', authenticate, requireRole(ROLE_NAMES.CUSTOMER), validateRequest({ body: createSupportSchema }), controller.create);
supportRoutes.get('/', authenticate, requireRole(ROLE_NAMES.CUSTOMER), controller.listMine);
supportRoutes.get(
  '/:id',
  authenticate,
  requireRole(ROLE_NAMES.CUSTOMER),
  validateRequest({ params: supportIdParamSchema }),
  controller.getMine
);

/** Mounted at `/admin/support` — never reachable by a customer. */
export const adminSupportRoutes = Router();
adminSupportRoutes.use(authenticate, requireAdmin);

adminSupportRoutes.get('/', validateRequest({ query: adminListSupportQuerySchema }), controller.adminList);
adminSupportRoutes.get('/:id', validateRequest({ params: supportIdParamSchema }), controller.adminGetById);
adminSupportRoutes.patch(
  '/:id',
  validateRequest({ params: supportIdParamSchema, body: adminUpdateSupportSchema }),
  controller.adminUpdate
);
