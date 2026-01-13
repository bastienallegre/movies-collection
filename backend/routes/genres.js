import express from 'express';
import {
  getAllGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre
} from '../controllers/genresController.js';

const router = express.Router();

// Routes CRUD pour les genres
router.get('/', getAllGenres);
router.get('/:id', getGenreById);
router.post('/', createGenre);
router.put('/:id', updateGenre);
router.delete('/:id', deleteGenre);

export default router;
