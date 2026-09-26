import { Router } from 'express';
import { LocationsController } from './locations.controller';

const router = Router();
const controller = new LocationsController();

// Public, read-only — supports the M2 search location field and the M3
// owner hotel-registration form's location picker.
router.get('/', controller.list);

export default router;
