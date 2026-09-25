import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes';
import authRoutes from '../modules/auth/auth.routes';
import profileRoutes from '../modules/profile/profile.routes';
import accountsRoutes from '../modules/accounts/accounts.routes';
import partnersRoutes from '../modules/partners/partners.routes';
import hotelsRoutes from '../modules/hotels/hotels.routes';
import amenitiesRoutes from '../modules/amenities/amenities.routes';
import { openApiSpec } from '../config/openapi';

const router = Router();

// Health routes
router.use('/', healthRoutes);

// Identity (M1)
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/admin/accounts', accountsRoutes);
router.use('/partners', partnersRoutes);

// Discovery (M2)
router.use('/hotels', hotelsRoutes);
router.use('/amenities', amenitiesRoutes);

// OpenAPI specification route
router.get('/openapi.json', (_req, res) => {
  res.json(openApiSpec);
});

export default router;
