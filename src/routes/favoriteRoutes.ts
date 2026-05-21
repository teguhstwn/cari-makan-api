import { Router } from 'express';
import { addFavorite } from '../controllers/favoriteController.js';

const router = Router();

router.post('/', addFavorite);

export default router;
