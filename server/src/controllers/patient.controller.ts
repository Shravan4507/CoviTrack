import { Request, Response } from 'express';
import { PatientRepository } from '../repositories/patient.repository';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { ReportRepository } from '../repositories/report.repository';
import { UserRepository } from '../repositories/user.repository';

export class PatientController {
  static async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const profile = await PatientRepository.findByUserId(userId);
      const appointments = await AppointmentRepository.findByPatientId(userId);
      const reports = await ReportRepository.findByPatientId(userId);

      const upcomingAppointments = appointments.filter(
        (a) => a.status === 'booked' || a.status === 'confirmed'
      );
      const completedAppointments = appointments.filter((a) => a.status === 'completed');

      res.status(200).json({
        success: true,
        data: {
          profile,
          statistics: {
            totalAppointments: appointments.length,
            upcomingAppointmentsCount: upcomingAppointments.length,
            completedAppointmentsCount: completedAppointments.length,
            totalReportsCount: reports.length,
          },
          upcomingAppointments: upcomingAppointments.slice(0, 5),
          recentAppointments: appointments.slice(0, 5),
          recentReports: reports.slice(0, 5),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async searchPatients(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string | undefined;
      const patients = await PatientRepository.searchPatients(query);
      res.status(200).json({
        success: true,
        data: patients,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getPatientDetails(req: Request, res: Response): Promise<void> {
    try {
      const patientUserId = parseInt(req.params.id, 10);
      if (isNaN(patientUserId)) {
        res.status(400).json({ success: false, error: 'Invalid patient ID.' });
        return;
      }

      const user = await UserRepository.findById(patientUserId);
      if (!user || user.role !== 'patient') {
        res.status(404).json({ success: false, error: 'Patient not found.' });
        return;
      }

      const profile = await PatientRepository.findByUserId(patientUserId);
      const appointments = await AppointmentRepository.findByPatientId(patientUserId);
      const reports = await ReportRepository.findByPatientId(patientUserId);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            mobileNumber: user.mobile_number,
            accountStatus: user.account_status,
            createdAt: user.created_at,
          },
          profile,
          appointments,
          reports,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

