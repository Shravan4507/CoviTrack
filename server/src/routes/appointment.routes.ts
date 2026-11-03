import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Slot management
router.get('/slots/available', AppointmentController.getAvailableSlots);
router.get('/slots', authenticateToken, requireRole('staff', 'admin'), AppointmentController.getAllSlots);
router.post('/slots', authenticateToken, requireRole('staff', 'admin'), AppointmentController.createSlot);
router.patch('/slots/:id/toggle', authenticateToken, requireRole('staff', 'admin'), AppointmentController.toggleSlotStatus);

// Appointment booking & management
router.post('/book', authenticateToken, requireRole('patient'), AppointmentController.bookAppointment);
router.get('/my', authenticateToken, requireRole('patient'), AppointmentController.getMyAppointments);
router.get('/', authenticateToken, requireRole('staff', 'admin'), AppointmentController.getAllAppointments);
router.post('/:id/cancel', authenticateToken, AppointmentController.cancelAppointment);
router.patch('/:id/status', authenticateToken, requireRole('staff', 'admin'), AppointmentController.updateStatus);

export default router;

