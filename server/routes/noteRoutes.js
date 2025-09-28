import { Router } from 'express';
import { createNote, getNotes, getNoteById, updateNote, deleteNote } from '../controllers/noteController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware); // Protect all routes below

router.post('/', createNote);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
