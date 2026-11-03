import { PoolConnection } from 'mysql2/promise';
import { getDbPool } from '../database/connection';
import { PatientProfile } from '../types';

export interface PatientDetailedView {
  userId: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  patientIdNumber: string;
  dateOfBirth: string;
  address: string;
  accountStatus: string;
  createdAt: Date;
  appointmentCount?: number;
  reportCount?: number;
}

export class PatientRepository {
  static async create(
    profile: {
      userId: number;
      patientIdNumber: string;
      dateOfBirth: string;
      address: string;
    },
    connection?: PoolConnection
  ): Promise<number> {
    const conn = connection || (getDbPool() as any);
    const [result]: any = await conn.execute(
      `INSERT INTO patient_profiles (user_id, patient_id_number, date_of_birth, address)
       VALUES (?, ?, ?, ?)`,
      [profile.userId, profile.patientIdNumber, profile.dateOfBirth, profile.address.trim()]
    );
    return result.insertId;
  }

  static async findByUserId(userId: number, connection?: PoolConnection): Promise<PatientProfile | null> {
    const conn = connection || (getDbPool() as any);
    const [rows]: any = await conn.execute(
      'SELECT id, user_id, patient_id_number, date_of_birth, address, created_at, updated_at FROM patient_profiles WHERE user_id = ?',
      [userId]
    );
    return rows.length > 0 ? (rows[0] as PatientProfile) : null;
  }

  static async findByPatientIdNumber(patientIdNumber: string): Promise<PatientDetailedView | null> {
    const pool = getDbPool();
    const [rows]: any = await pool.execute(
      `SELECT u.id AS userId, u.full_name AS fullName, u.email, u.mobile_number AS mobileNumber,
              p.patient_id_number AS patientIdNumber, DATE_FORMAT(p.date_of_birth, '%Y-%m-%d') AS dateOfBirth,
              p.address, u.account_status AS accountStatus, p.created_at AS createdAt
       FROM users u
       INNER JOIN patient_profiles p ON u.id = p.user_id
       WHERE p.patient_id_number = ?`,
      [patientIdNumber.trim()]
    );
    return rows.length > 0 ? (rows[0] as PatientDetailedView) : null;
  }

  static async searchPatients(queryStr?: string): Promise<PatientDetailedView[]> {
    const pool = getDbPool();
    let sql = `
      SELECT u.id AS userId, u.full_name AS fullName, u.email, u.mobile_number AS mobileNumber,
             p.patient_id_number AS patientIdNumber, DATE_FORMAT(p.date_of_birth, '%Y-%m-%d') AS dateOfBirth,
             p.address, u.account_status AS accountStatus, p.created_at AS createdAt,
             (SELECT COUNT(*) FROM appointments a WHERE a.patient_id = u.id) AS appointmentCount,
             (SELECT COUNT(*) FROM diagnostic_reports r WHERE r.patient_id = u.id) AS reportCount
      FROM users u
      INNER JOIN patient_profiles p ON u.id = p.user_id
      WHERE u.role = 'patient'
    `;

    const params: any[] = [];
    if (queryStr && queryStr.trim().length > 0) {
      const q = `%${queryStr.trim()}%`;
      sql += ` AND (p.patient_id_number LIKE ? OR u.full_name LIKE ? OR u.mobile_number LIKE ? OR u.email LIKE ?)`;
      params.push(q, q, q, q);
    }

    sql += ` ORDER BY p.created_at DESC`;
    const [rows]: any = await pool.execute(sql, params);
    return rows as PatientDetailedView[];
  }
}

