import express from 'express';
import {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} from '../controllers/moviesController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Routes CRUD pour les films
router.get('/', getAllMovies);
router.get('/:id', getMovieById);
router.post('/', protect, createMovie);
router.put('/:id', protect, updateMovie);
router.delete('/:id', protect, deleteMovie);

export default router;
