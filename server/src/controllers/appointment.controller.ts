import { Request, Response } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { AppointmentStatus } from '../types';

export class AppointmentController {
  static async getAvailableSlots(req: Request, res: Response): Promise<void> {
    try {
      const slots = await AppointmentService.getAvailableSlots();
      res.status(200).json({ success: true, data: slots });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getAllSlots(req: Request, res: Response): Promise<void> {
    try {
      const slots = await AppointmentService.getAllSlots();
      res.status(200).json({ success: true, data: slots });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async createSlot(req: Request, res: Response): Promise<void> {
    try {
      const { startTime, endTime, maxCapacity } = req.body;
      const createdBy = req.user!.userId;

      const result = await AppointmentService.createSlot({
        startTime,
        endTime,
        maxCapacity: parseInt(maxCapacity, 10),
        createdBy,
      });

      if (!result.success) {
        res.status(400).json({ success: false, error: result.error });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Appointment slot created successfully.',
        data: { slotId: result.slotId },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async toggleSlotStatus(req: Request, res: Response): Promise<void> {
    try {
      const slotId = parseInt(req.params.id, 10);
      const { isActive } = req.body;

      if (isNaN(slotId) || typeof isActive !== 'boolean') {
        res.status(400).json({ success: false, error: 'Valid slot ID and isActive status are required.' });
        return;
      }

      const result = await AppointmentService.toggleSlotStatus(slotId, isActive, req.user!.userId);
      if (!result.success) {
        res.status(400).json({ success: false, error: result.error || 'Failed to update slot status.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Slot status updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async bookAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { slotId, testType } = req.body;
      const patientId = req.user!.userId;

      const result = await AppointmentService.bookAppointment({
        patientId,
        slotId: parseInt(slotId, 10),
        testType,
      });

      if (!result.success) {
        res.status(400).json({ success: false, error: result.error });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully.',
        data: result.data,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getMyAppointments(req: Request, res: Response): Promise<void> {
    try {
      const patientId = req.user!.userId;
      const appointments = await AppointmentService.getPatientAppointments(patientId);
      res.status(200).json({ success: true, data: appointments });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getAllAppointments(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as AppointmentStatus | undefined;
      const search = req.query.search as string | undefined;

      const appointments = await AppointmentService.getAppointments({ status, search });
      res.status(200).json({ success: true, data: appointments });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async cancelAppointment(req: Request, res: Response): Promise<void> {
    try {
      const appointmentId = parseInt(req.params.id, 10);
      if (isNaN(appointmentId)) {
        res.status(400).json({ success: false, error: 'Invalid appointment ID.' });
        return;
      }

      const result = await AppointmentService.cancelAppointment(
        appointmentId,
        req.user!.userId,
        req.user!.role
      );

      if (!result.success) {
        res.status(400).json({ success: false, error: result.error });
        return;
      }

      res.status(200).json({ success: true, message: result.message });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const appointmentId = parseInt(req.params.id, 10);
      const { status } = req.body;

      if (isNaN(appointmentId) || !status) {
        res.status(400).json({ success: false, error: 'Valid appointment ID and new status are required.' });
        return;
      }

      const result = await AppointmentService.updateAppointmentStatus(
        appointmentId,
        status as AppointmentStatus,
        req.user!.userId
      );

      if (!result.success) {
        res.status(400).json({ success: false, error: result.error });
        return;
      }

      res.status(200).json({ success: true, message: result.message });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

