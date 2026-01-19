import express from 'express';
import {
  getAllCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  addMovieToCollection,
  removeMovieFromCollection
} from '../controllers/collectionsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Routes CRUD pour les collections
router.get('/', getAllCollections);
router.get('/:id', getCollectionById);
router.post('/', protect, createCollection);
router.put('/:id', protect, updateCollection);
router.delete('/:id', protect, deleteCollection);

// Routes pour gérer les films dans les collections
router.post('/:id/movies', protect, addMovieToCollection);
router.delete('/:id/movies/:movieId', protect, removeMovieFromCollection);

export default router;
