import { Router } from 'express';
import { addFavorite } from '../controllers/favoriteController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticateToken, addFavorite);

export default router;
