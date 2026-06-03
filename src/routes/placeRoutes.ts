import { Router } from 'express';
import { getNearbyPlaces, getRecommendedPlaces, searchPlaces } from '../controllers/placeController.js';

const router = Router();

router.get('/nearby', getNearbyPlaces);
router.get('/recommendations', getRecommendedPlaces);
router.get('/search', searchPlaces);

export default router;
