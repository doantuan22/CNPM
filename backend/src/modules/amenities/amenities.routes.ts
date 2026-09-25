import { Router } from 'express';
import { AmenitiesController } from './amenities.controller';

const router = Router();
const controller = new AmenitiesController();

// Public, read-only — supports the M2 search filter UI (amenity checkboxes).
router.get('/', controller.list);

export default router;
