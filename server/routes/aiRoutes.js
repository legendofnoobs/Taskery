import { Router } from 'express';
import { handleChat } from '../controllers/aiController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/chat', handleChat);

export default router;
