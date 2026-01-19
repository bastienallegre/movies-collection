import express from 'express';
import {
  getAllGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre
} from '../controllers/genresController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Routes CRUD pour les genres
router.get('/', getAllGenres);
router.get('/:id', getGenreById);
router.post('/', protect, createGenre);
router.put('/:id', protect, updateGenre);
router.delete('/:id', protect, deleteGenre);

export default router;
