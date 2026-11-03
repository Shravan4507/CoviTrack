import { ReportRepository, DetailedReport } from '../repositories/report.repository';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { withTransaction } from '../database/connection';
import { PdfService } from './pdf.service';
import { DiagnosticResult } from '../types';
import { isValidIsoDate, isValidDateFormat, formatDdmmyyyyToIso } from '../validators/regex.validators';

export class ReportService {
  static async createReport(data: {
    appointmentId: number;
    testResult: DiagnosticResult;
    testingDate: string;
    notes?: string;
    staffId: number;
  }) {
    if (!data.appointmentId) {
      return { success: false, error: 'Appointment ID is required.' };
    }

    const validResults: DiagnosticResult[] = ['positive', 'negative', 'inconclusive'];
    if (!data.testResult || !validResults.includes(data.testResult.toLowerCase() as DiagnosticResult)) {
      return { success: false, error: 'Valid test result is required (positive, negative, inconclusive).' };
    }

    let isoDate = '';
    if (!data.testingDate) {
      return { success: false, error: 'Testing date is required.' };
    } else if (isValidIsoDate(data.testingDate)) {
      isoDate = data.testingDate;
    } else if (isValidDateFormat(data.testingDate)) {
      isoDate = formatDdmmyyyyToIso(data.testingDate);
    } else {
      return { success: false, error: 'Testing date must be in DD-MM-YYYY or YYYY-MM-DD format.' };
    }

    // 1. Verify appointment exists
    const appt = await AppointmentRepository.findById(data.appointmentId);
    if (!appt) {
      return { success: false, error: 'Appointment not found.' };
    }

    if (appt.status === 'cancelled') {
      return { success: false, error: 'Cannot create diagnostic report for a cancelled appointment.' };
    }

    // 2. Check for existing report
    const existing = await ReportRepository.findByAppointmentId(data.appointmentId);
    if (existing) {
      return { success: false, error: 'A diagnostic report has already been created for this appointment.' };
    }

    // 3. Generate unique report reference (COVI-REP-XXXXXX)
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const reportReference = `COVI-REP-${randomSuffix}`;

    // 4. Save report in transaction and set appointment status to 'completed'
    const reportId = await withTransaction(async (connection) => {
      const id = await ReportRepository.create(
        {
          appointmentId: data.appointmentId,
          patientId: appt.patientId,
          reportReference,
          testResult: data.testResult.toLowerCase() as DiagnosticResult,
          testingDate: isoDate,
          staffId: data.staffId,
          notes: data.notes?.trim(),
        },
        connection
      );

      // Ensure appointment status is marked completed
      await AppointmentRepository.updateStatus(data.appointmentId, 'completed', connection);

      return id;
    });

    // 5. Generate PDF asynchronously/immediately
    const detailedReport = await ReportRepository.findById(reportId);
    if (detailedReport) {
      try {
        const pdfPath = await PdfService.generateReportPdf(detailedReport);
        await ReportRepository.updatePdfPath(reportId, pdfPath);
      } catch (err: any) {
        console.error('[PDF Generation Error]', err.message);
      }
    }

    await AuditRepository.log({
      userId: data.staffId,
      action: 'REPORT_CREATED',
      entityType: 'REPORT',
      entityId: reportId,
      details: `Created report #${reportId} (${reportReference}) for appointment #${data.appointmentId}`,
    });

    return {
      success: true,
      data: {
        reportId,
        reportReference,
      },
    };
  }

  static async getReportById(reportId: number, requestingUserId: number, requestingRole: string) {
    const report = await ReportRepository.findById(reportId);
    if (!report) {
      return { success: false, status: 404, error: 'Diagnostic report not found.' };
    }

    // Strict access control: patient can only access their own report
    if (requestingRole === 'patient' && report.patientId !== requestingUserId) {
      return { success: false, status: 403, error: 'Forbidden: You do not have permission to view this report.' };
    }

    return { success: true, status: 200, data: report };
  }

  static async getPatientReports(patientId: number): Promise<DetailedReport[]> {
    return ReportRepository.findByPatientId(patientId);
  }

  static async getAllReports(filters?: { result?: DiagnosticResult; search?: string }): Promise<DetailedReport[]> {
    return ReportRepository.findAll(filters);
  }
}

