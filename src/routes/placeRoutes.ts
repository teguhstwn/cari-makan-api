import { Router } from 'express';
import { getNearbyPlaces } from '../controllers/placeController.js';

const router = Router();

router.get('/nearby', getNearbyPlaces);

export default router;
