import { Router } from 'express';
const router = Router();
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateProfile);

export default router;