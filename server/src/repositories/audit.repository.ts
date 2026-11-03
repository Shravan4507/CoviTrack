import { getDbPool } from '../database/connection';
import { AuditLog } from '../types';

export class AuditRepository {
  static async log(entry: {
    userId?: number | null;
    action: string;
    entityType: string;
    entityId?: number | null;
    ipAddress?: string;
    details?: string;
  }): Promise<void> {
    try {
      const pool = getDbPool();
      await pool.execute(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, details)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          entry.userId || null,
          entry.action,
          entry.entityType,
          entry.entityId || null,
          entry.ipAddress || null,
          entry.details || null,
        ]
      );
    } catch (err: any) {
      console.error('[Audit Log Error]', err.message);
    }
  }

  static async findRecent(limit = 100): Promise<any[]> {
    const pool = getDbPool();
    const [rows]: any = await pool.execute(
      `SELECT a.id, a.user_id AS userId, u.full_name AS userName, u.role AS userRole,
              a.action, a.entity_type AS entityType, a.entity_id AS entityId,
              a.ip_address AS ipAddress, a.details, a.created_at AS createdAt
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  static async getSystemStatistics(): Promise<any> {
    const pool = getDbPool();
    const [[userCounts]]: any = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN role = 'patient' THEN 1 END) AS totalPatients,
        COUNT(CASE WHEN role = 'staff' THEN 1 END) AS totalStaff,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) AS totalAdmins
      FROM users
    `);

    const [[apptCounts]]: any = await pool.execute(`
      SELECT 
        COUNT(*) AS totalAppointments,
        COUNT(CASE WHEN status = 'booked' THEN 1 END) AS bookedAppointments,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) AS confirmedAppointments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completedAppointments,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelledAppointments
      FROM appointments
    `);

    const [[reportCounts]]: any = await pool.execute(`
      SELECT 
        COUNT(*) AS totalReports,
        COUNT(CASE WHEN test_result = 'positive' THEN 1 END) AS positiveReports,
        COUNT(CASE WHEN test_result = 'negative' THEN 1 END) AS negativeReports,
        COUNT(CASE WHEN test_result = 'inconclusive' THEN 1 END) AS inconclusiveReports
      FROM diagnostic_reports
    `);

    const [[slotCounts]]: any = await pool.execute(`
      SELECT 
        COUNT(*) AS totalSlots,
        COUNT(CASE WHEN is_active = TRUE AND start_time > NOW() THEN 1 END) AS upcomingActiveSlots
      FROM appointment_slots
    `);

    return {
      users: userCounts,
      appointments: apptCounts,
      reports: reportCounts,
      slots: slotCounts,
    };
  }
}

