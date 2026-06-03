import { Router } from 'express';
import { getNearbyPlaces, getRecommendedPlaces, searchPlaces, getPlaceDetails } from '../controllers/placeController.js';

const router = Router();

router.get('/nearby', getNearbyPlaces);
router.get('/recommendations', getRecommendedPlaces);
router.get('/search', searchPlaces);
router.get('/:id', getPlaceDetails);

export default router;
