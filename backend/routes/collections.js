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

const router = express.Router();

// Routes CRUD pour les collections
router.get('/', getAllCollections);
router.get('/:id', getCollectionById);
router.post('/', createCollection);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

// Routes pour gérer les films dans les collections
router.post('/:id/movies', addMovieToCollection);
router.delete('/:id/movies/:movieId', removeMovieFromCollection);

export default router;
