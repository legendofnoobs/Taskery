import { Router } from 'express';
import { searchAll } from '../controllers/searchController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', searchAll);

export default router;
