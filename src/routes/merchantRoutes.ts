import { Router } from 'express';
import { getMerchants } from '../controllers/merchantController.js';

const router = Router();

router.get('/', getMerchants);

export default router;
