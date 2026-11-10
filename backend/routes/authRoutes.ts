import { Router } from 'express';
import { register, login, getCurrentUser, forgotPassword } from '../controllers/authController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);
router.post('/forgot-password', forgotPassword);

export default router;
