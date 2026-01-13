import express from 'express';
import {
  getAllDirectors,
  getDirectorById,
  createDirector,
  updateDirector,
  deleteDirector
} from '../controllers/directorsController.js';

const router = express.Router();

// Routes CRUD pour les réalisateurs
router.get('/', getAllDirectors);
router.get('/:id', getDirectorById);
router.post('/', createDirector);
router.put('/:id', updateDirector);
router.delete('/:id', deleteDirector);

export default router;
