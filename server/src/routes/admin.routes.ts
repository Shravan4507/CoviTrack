import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateToken, requireRole('admin'));

router.get('/stats', AdminController.getStats);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/users', AdminController.getAllUsers);
router.post('/staff', AdminController.createStaff);
router.patch('/users/:id/status', AdminController.toggleUserStatus);

export default router;

