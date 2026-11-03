import { PoolConnection } from 'mysql2/promise';
import { getDbPool } from '../database/connection';
import { Appointment, AppointmentStatus } from '../types';

export interface DetailedAppointment {
  id: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  patientMobile: string;
  patientIdNumber?: string;
  slotId: number;
  slotStartTime: string;
  slotEndTime: string;
  testType: string;
  bookingReference: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
  hasReport?: boolean;
}

export class AppointmentRepository {
  static async create(
    appt: {
      patientId: number;
      slotId: number;
      testType: string;
      bookingReference: string;
      status?: AppointmentStatus;
    },
    connection: PoolConnection
  ): Promise<number> {
    const [result]: any = await connection.execute(
      `INSERT INTO appointments (patient_id, slot_id, test_type, booking_reference, status)
       VALUES (?, ?, ?, ?, ?)`,
      [appt.patientId, appt.slotId, appt.testType, appt.bookingReference, appt.status || 'booked']
    );
    return result.insertId;
  }

  static async findById(id: number, connection?: PoolConnection): Promise<DetailedAppointment | null> {
    const conn = connection || (getDbPool() as any);
    const [rows]: any = await conn.execute(
      `SELECT a.id, a.patient_id AS patientId, u.full_name AS patientName, u.email AS patientEmail,
              u.mobile_number AS patientMobile, p.patient_id_number AS patientIdNumber,
              a.slot_id AS slotId,
              DATE_FORMAT(s.start_time, '%Y-%m-%d %H:%i:%s') AS slotStartTime,
              DATE_FORMAT(s.end_time, '%Y-%m-%d %H:%i:%s') AS slotEndTime,
              a.test_type AS testType, a.booking_reference AS bookingReference,
              a.status, a.created_at AS createdAt, a.updated_at AS updatedAt,
              (EXISTS(SELECT 1 FROM diagnostic_reports r WHERE r.appointment_id = a.id)) AS hasReport
       FROM appointments a
       INNER JOIN users u ON a.patient_id = u.id
       LEFT JOIN patient_profiles p ON u.id = p.user_id
       INNER JOIN appointment_slots s ON a.slot_id = s.id
       WHERE a.id = ?`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as DetailedAppointment) : null;
  }

  static async findExistingActiveBooking(
    patientId: number,
    slotId: number,
    connection?: PoolConnection
  ): Promise<Appointment | null> {
    const conn = connection || (getDbPool() as any);
    const [rows]: any = await conn.execute(
      `SELECT id, patient_id, slot_id, test_type, booking_reference, status, created_at, updated_at
       FROM appointments
       WHERE patient_id = ? AND slot_id = ? AND status IN ('booked', 'confirmed')`,
      [patientId, slotId]
    );
    return rows.length > 0 ? (rows[0] as Appointment) : null;
  }

  static async findByPatientId(patientId: number): Promise<DetailedAppointment[]> {
    const pool = getDbPool();
    const [rows]: any = await pool.execute(
      `SELECT a.id, a.patient_id AS patientId, u.full_name AS patientName, u.email AS patientEmail,
              u.mobile_number AS patientMobile, p.patient_id_number AS patientIdNumber,
              a.slot_id AS slotId,
              DATE_FORMAT(s.start_time, '%Y-%m-%d %H:%i:%s') AS slotStartTime,
              DATE_FORMAT(s.end_time, '%Y-%m-%d %H:%i:%s') AS slotEndTime,
              a.test_type AS testType, a.booking_reference AS bookingReference,
              a.status, a.created_at AS createdAt, a.updated_at AS updatedAt,
              (EXISTS(SELECT 1 FROM diagnostic_reports r WHERE r.appointment_id = a.id)) AS hasReport
       FROM appointments a
       INNER JOIN users u ON a.patient_id = u.id
       LEFT JOIN patient_profiles p ON u.id = p.user_id
       INNER JOIN appointment_slots s ON a.slot_id = s.id
       WHERE a.patient_id = ?
       ORDER BY s.start_time DESC`,
      [patientId]
    );
    return rows as DetailedAppointment[];
  }

  static async findAll(filters?: {
    status?: AppointmentStatus;
    search?: string;
  }): Promise<DetailedAppointment[]> {
    const pool = getDbPool();
    let sql = `
      SELECT a.id, a.patient_id AS patientId, u.full_name AS patientName, u.email AS patientEmail,
             u.mobile_number AS patientMobile, p.patient_id_number AS patientIdNumber,
             a.slot_id AS slotId,
             DATE_FORMAT(s.start_time, '%Y-%m-%d %H:%i:%s') AS slotStartTime,
             DATE_FORMAT(s.end_time, '%Y-%m-%d %H:%i:%s') AS slotEndTime,
             a.test_type AS testType, a.booking_reference AS bookingReference,
             a.status, a.created_at AS createdAt, a.updated_at AS updatedAt,
             (EXISTS(SELECT 1 FROM diagnostic_reports r WHERE r.appointment_id = a.id)) AS hasReport
      FROM appointments a
      INNER JOIN users u ON a.patient_id = u.id
      LEFT JOIN patient_profiles p ON u.id = p.user_id
      INNER JOIN appointment_slots s ON a.slot_id = s.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters?.status) {
      conditions.push('a.status = ?');
      params.push(filters.status);
    }
    if (filters?.search && filters.search.trim().length > 0) {
      const q = `%${filters.search.trim()}%`;
      conditions.push('(a.booking_reference LIKE ? OR u.full_name LIKE ? OR u.mobile_number LIKE ? OR p.patient_id_number LIKE ?)');
      params.push(q, q, q, q);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY s.start_time DESC';

    const [rows]: any = await pool.execute(sql, params);
    return rows as DetailedAppointment[];
  }

  static async updateStatus(
    id: number,
    status: AppointmentStatus,
    connection?: PoolConnection
  ): Promise<boolean> {
    const conn = connection || (getDbPool() as any);
    const [result]: any = await conn.execute(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }
}

