import express from 'express';
import { register, login, getMe, updatePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Routes protégées (authentification requise)
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);

export default router;
