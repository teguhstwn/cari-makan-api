import { Router } from 'express';
import { getNearbyPlaces, getRecommendedPlaces } from '../controllers/placeController.js';

const router = Router();

router.get('/nearby', getNearbyPlaces);
router.get('/recommendations', getRecommendedPlaces);

export default router;
