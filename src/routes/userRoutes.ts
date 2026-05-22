import { Router } from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authenticateToken, getUserProfile);

export default router;
