import { Request, Response } from 'express';
import fs from 'fs';
import { ReportService } from '../services/report.service';
import { ReportRepository } from '../repositories/report.repository';
import { PdfService } from '../services/pdf.service';
import { DiagnosticResult } from '../types';

export class ReportController {
  static async createReport(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId, testResult, testingDate, notes } = req.body;
      const staffId = req.user!.userId;

      const result = await ReportService.createReport({
        appointmentId: parseInt(appointmentId, 10),
        testResult,
        testingDate,
        notes,
        staffId,
      });

      if (!result.success) {
        res.status(400).json({ success: false, error: result.error });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Diagnostic report created successfully.',
        data: result.data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getMyReports(req: Request, res: Response): Promise<void> {
    try {
      const patientId = req.user!.userId;
      const reports = await ReportService.getPatientReports(patientId);
      res.status(200).json({ success: true, data: reports });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getAllReports(req: Request, res: Response): Promise<void> {
    try {
      const result = req.query.result as DiagnosticResult | undefined;
      const search = req.query.search as string | undefined;

      const reports = await ReportService.getAllReports({ result, search });
      res.status(200).json({ success: true, data: reports });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getReportById(req: Request, res: Response): Promise<void> {
    try {
      const reportId = parseInt(req.params.id, 10);
      if (isNaN(reportId)) {
        res.status(400).json({ success: false, error: 'Invalid report ID.' });
        return;
      }

      const result = await ReportService.getReportById(
        reportId,
        req.user!.userId,
        req.user!.role
      );

      if (!result.success) {
        res.status(result.status || 400).json({ success: false, error: result.error });
        return;
      }

      res.status(200).json({ success: true, data: result.data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async downloadReportPdf(req: Request, res: Response): Promise<void> {
    try {
      const reportId = parseInt(req.params.id, 10);
      if (isNaN(reportId)) {
        res.status(400).json({ success: false, error: 'Invalid report ID.' });
        return;
      }

      const reportCheck = await ReportService.getReportById(
        reportId,
        req.user!.userId,
        req.user!.role
      );

      if (!reportCheck.success || !reportCheck.data) {
        res.status(reportCheck.status || 404).json({ success: false, error: reportCheck.error });
        return;
      }

      const report = reportCheck.data;
      let pdfPath = report.pdfPath;

      // If PDF file doesn't exist on disk, regenerate it on demand
      if (!pdfPath || !fs.existsSync(pdfPath)) {
        pdfPath = await PdfService.generateReportPdf(report);
        await ReportRepository.updatePdfPath(report.id, pdfPath);
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="CoviTrack-Report-${report.reportReference}.pdf"`
      );

      const fileStream = fs.createReadStream(pdfPath);
      fileStream.pipe(res);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

