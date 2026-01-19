import express from 'express';
import {
  getAllDirectors,
  getDirectorById,
  createDirector,
  updateDirector,
  deleteDirector
} from '../controllers/directorsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Routes CRUD pour les réalisateurs
router.get('/', getAllDirectors);
router.get('/:id', getDirectorById);
router.post('/', protect, createDirector);
router.put('/:id', protect, updateDirector);
router.delete('/:id', protect, deleteDirector);

export default router;
