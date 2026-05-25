import { Router } from 'express';
import { addFavorite, getFavorites } from '../controllers/favoriteController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticateToken, addFavorite);
router.get('/', authenticateToken, getFavorites);

export default router;
