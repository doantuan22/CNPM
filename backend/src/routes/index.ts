import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes';
import { openApiSpec } from '../config/openapi';

const router = Router();

// Health routes
router.use('/', healthRoutes);

// OpenAPI specification route
router.get('/openapi.json', (_req, res) => {
  res.json(openApiSpec);
});

export default router;
