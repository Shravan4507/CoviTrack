import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Patient dashboard (accessible by authenticated patient)
router.get('/dashboard', authenticateToken, requireRole('patient'), PatientController.getDashboard);

// Staff and Admin patient management
router.get('/search', authenticateToken, requireRole('staff', 'admin'), PatientController.searchPatients);
router.get('/:id', authenticateToken, requireRole('staff', 'admin'), PatientController.getPatientDetails);

export default router;

