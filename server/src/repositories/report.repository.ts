import { PoolConnection } from 'mysql2/promise';
import { getDbPool } from '../database/connection';
import { DiagnosticReport, DiagnosticResult } from '../types';

export interface DetailedReport {
  id: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  patientMobile: string;
  patientIdNumber?: string;
  dateOfBirth?: string;
  address?: string;
  testType: string;
  bookingReference: string;
  reportReference: string;
  testResult: DiagnosticResult;
  testingDate: string;
  staffId: number;
  staffName: string;
  notes?: string;
  pdfPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ReportRepository {
  static async create(
    report: {
      appointmentId: number;
      patientId: number;
      reportReference: string;
      testResult: DiagnosticResult;
      testingDate: string;
      staffId: number;
      notes?: string;
      pdfPath?: string;
    },
    connection?: PoolConnection
  ): Promise<number> {
    const conn = connection || (getDbPool() as any);
    const [result]: any = await conn.execute(
      `INSERT INTO diagnostic_reports (appointment_id, patient_id, report_reference, test_result, testing_date, staff_id, notes, pdf_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        report.appointmentId,
        report.patientId,
        report.reportReference,
        report.testResult,
        report.testingDate,
        report.staffId,
        report.notes || null,
        report.pdfPath || null,
      ]
    );
    return result.insertId;
  }

  static async findById(id: number): Promise<DetailedReport | null> {
    const pool = getDbPool();
    const [rows]: any = await pool.execute(
      `SELECT r.id, r.appointment_id AS appointmentId, r.patient_id AS patientId,
              u.full_name AS patientName, u.email AS patientEmail, u.mobile_number AS patientMobile,
              p.patient_id_number AS patientIdNumber, DATE_FORMAT(p.date_of_birth, '%Y-%m-%d') AS dateOfBirth,
              p.address,
              a.test_type AS testType, a.booking_reference AS bookingReference,
              r.report_reference AS reportReference, r.test_result AS testResult,
              DATE_FORMAT(r.testing_date, '%Y-%m-%d') AS testingDate,
              r.staff_id AS staffId, su.full_name AS staffName,
              r.notes, r.pdf_path AS pdfPath, r.created_at AS createdAt, r.updated_at AS updatedAt
       FROM diagnostic_reports r
       INNER JOIN appointments a ON r.appointment_id = a.id
       INNER JOIN users u ON r.patient_id = u.id
       LEFT JOIN patient_profiles p ON u.id = p.user_id
       INNER JOIN users su ON r.staff_id = su.id
       WHERE r.id = ?`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as DetailedReport) : null;
  }

  static async findByAppointmentId(appointmentId: number): Promise<DiagnosticReport | null> {
    const pool = getDbPool();
    const [rows]: any = await pool.execute(
      `SELECT id, appointment_id, patient_id, report_reference, test_result,
              DATE_FORMAT(testing_date, '%Y-%m-%d') AS testing_date,
              staff_id, notes, pdf_path, created_at, updated_at
       FROM diagnostic_reports WHERE appointment_id = ?`,
      [appointmentId]
    );
    return rows.length > 0 ? (rows[0] as DiagnosticReport) : null;
  }

  static async findByReportReference(reportReference: string): Promise<DetailedReport | null> {
    const pool = getDbPool();
    const [rows]: any = await pool.execute(
      `SELECT r.id, r.appointment_id AS appointmentId, r.patient_id AS patientId,
              u.full_name AS patientName, u.email AS patientEmail, u.mobile_number AS patientMobile,
              p.patient_id_number AS patientIdNumber, DATE_FORMAT(p.date_of_birth, '%Y-%m-%d') AS dateOfBirth,
              p.address,
              a.test_type AS testType, a.booking_reference AS bookingReference,
              r.report_reference AS reportReference, r.test_result AS testResult,
              DATE_FORMAT(r.testing_date, '%Y-%m-%d') AS testingDate,
              r.staff_id AS staffId, su.full_name AS staffName,
              r.notes, r.pdf_path AS pdfPath, r.created_at AS createdAt, r.updated_at AS updatedAt
       FROM diagnostic_reports r
       INNER JOIN appointments a ON r.appointment_id = a.id
       INNER JOIN users u ON r.patient_id = u.id
       LEFT JOIN patient_profiles p ON u.id = p.user_id
       INNER JOIN users su ON r.staff_id = su.id
       WHERE r.report_reference = ?`,
      [reportReference.trim()]
    );
    return rows.length > 0 ? (rows[0] as DetailedReport) : null;
  }

  static async findByPatientId(patientId: number): Promise<DetailedReport[]> {
    const pool = getDbPool();
    const [rows]: any = await pool.execute(
      `SELECT r.id, r.appointment_id AS appointmentId, r.patient_id AS patientId,
              u.full_name AS patientName, u.email AS patientEmail, u.mobile_number AS patientMobile,
              p.patient_id_number AS patientIdNumber, DATE_FORMAT(p.date_of_birth, '%Y-%m-%d') AS dateOfBirth,
              p.address,
              a.test_type AS testType, a.booking_reference AS bookingReference,
              r.report_reference AS reportReference, r.test_result AS testResult,
              DATE_FORMAT(r.testing_date, '%Y-%m-%d') AS testingDate,
              r.staff_id AS staffId, su.full_name AS staffName,
              r.notes, r.pdf_path AS pdfPath, r.created_at AS createdAt, r.updated_at AS updatedAt
       FROM diagnostic_reports r
       INNER JOIN appointments a ON r.appointment_id = a.id
       INNER JOIN users u ON r.patient_id = u.id
       LEFT JOIN patient_profiles p ON u.id = p.user_id
       INNER JOIN users su ON r.staff_id = su.id
       WHERE r.patient_id = ?
       ORDER BY r.testing_date DESC, r.created_at DESC`,
      [patientId]
    );
    return rows as DetailedReport[];
  }

  static async findAll(filters?: { result?: DiagnosticResult; search?: string }): Promise<DetailedReport[]> {
    const pool = getDbPool();
    let sql = `
      SELECT r.id, r.appointment_id AS appointmentId, r.patient_id AS patientId,
             u.full_name AS patientName, u.email AS patientEmail, u.mobile_number AS patientMobile,
             p.patient_id_number AS patientIdNumber, DATE_FORMAT(p.date_of_birth, '%Y-%m-%d') AS dateOfBirth,
             p.address,
             a.test_type AS testType, a.booking_reference AS bookingReference,
             r.report_reference AS reportReference, r.test_result AS testResult,
             DATE_FORMAT(r.testing_date, '%Y-%m-%d') AS testingDate,
             r.staff_id AS staffId, su.full_name AS staffName,
             r.notes, r.pdf_path AS pdfPath, r.created_at AS createdAt, r.updated_at AS updatedAt
      FROM diagnostic_reports r
      INNER JOIN appointments a ON r.appointment_id = a.id
      INNER JOIN users u ON r.patient_id = u.id
      LEFT JOIN patient_profiles p ON u.id = p.user_id
      INNER JOIN users su ON r.staff_id = su.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters?.result) {
      conditions.push('r.test_result = ?');
      params.push(filters.result);
    }
    if (filters?.search && filters.search.trim().length > 0) {
      const q = `%${filters.search.trim()}%`;
      conditions.push('(r.report_reference LIKE ? OR a.booking_reference LIKE ? OR u.full_name LIKE ? OR p.patient_id_number LIKE ?)');
      params.push(q, q, q, q);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY r.testing_date DESC, r.created_at DESC';

    const [rows]: any = await pool.execute(sql, params);
    return rows as DetailedReport[];
  }

  static async updatePdfPath(id: number, pdfPath: string): Promise<boolean> {
    const pool = getDbPool();
    const [result]: any = await pool.execute(
      'UPDATE diagnostic_reports SET pdf_path = ? WHERE id = ?',
      [pdfPath, id]
    );
    return result.affectedRows > 0;
  }
}

