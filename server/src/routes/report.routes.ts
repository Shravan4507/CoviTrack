import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.post('/', authenticateToken, requireRole('staff', 'admin'), ReportController.createReport);
router.get('/my', authenticateToken, requireRole('patient'), ReportController.getMyReports);
router.get('/', authenticateToken, requireRole('staff', 'admin'), ReportController.getAllReports);
router.get('/:id', authenticateToken, ReportController.getReportById);
router.get('/:id/pdf', authenticateToken, ReportController.downloadReportPdf);

export default router;

