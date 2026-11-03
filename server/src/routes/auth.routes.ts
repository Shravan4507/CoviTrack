import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/register', authRateLimiter(20, 15), AuthController.register);
router.post('/login', authRateLimiter(20, 15), AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', authenticateToken, AuthController.getCurrentUser);

export default router;

