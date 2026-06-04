import { Router } from 'express';
import { getNearbyPlaces, getRecommendedPlaces, searchPlaces, getPlaceDetails } from '../controllers/placeController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/nearby', authenticateToken, getNearbyPlaces);
router.get('/recommendations', authenticateToken, getRecommendedPlaces);
router.get('/search', authenticateToken, searchPlaces);
router.get('/:id', authenticateToken, getPlaceDetails);

export default router;
