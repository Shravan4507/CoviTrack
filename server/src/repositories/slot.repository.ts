import { PoolConnection } from 'mysql2/promise';
import { getDbPool } from '../database/connection';
import { AppointmentSlot } from '../types';

export class SlotRepository {
  static async create(
    slot: {
      startTime: string;
      endTime: string;
      maxCapacity: number;
      createdBy: number;
    },
    connection?: PoolConnection
  ): Promise<number> {
    const conn = connection || (getDbPool() as any);
    const [result]: any = await conn.execute(
      `INSERT INTO appointment_slots (start_time, end_time, max_capacity, current_bookings, is_active, created_by)
       VALUES (?, ?, ?, 0, TRUE, ?)`,
      [slot.startTime, slot.endTime, slot.maxCapacity, slot.createdBy]
    );
    return result.insertId;
  }

  static async findById(id: number, connection?: PoolConnection): Promise<AppointmentSlot | null> {
    const conn = connection || (getDbPool() as any);
    const [rows]: any = await conn.execute(
      `SELECT id, DATE_FORMAT(start_time, '%Y-%m-%d %H:%i:%s') AS start_time,
              DATE_FORMAT(end_time, '%Y-%m-%d %H:%i:%s') AS end_time,
              max_capacity, current_bookings, is_active, created_by, created_at, updated_at
       FROM appointment_slots WHERE id = ?`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as AppointmentSlot) : null;
  }

  static async findByIdForUpdate(id: number, connection: PoolConnection): Promise<AppointmentSlot | null> {
    const [rows]: any = await connection.execute(
      `SELECT id, DATE_FORMAT(start_time, '%Y-%m-%d %H:%i:%s') AS start_time,
              DATE_FORMAT(end_time, '%Y-%m-%d %H:%i:%s') AS end_time,
              max_capacity, current_bookings, is_active, created_by, created_at, updated_at
       FROM appointment_slots WHERE id = ? FOR UPDATE`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as AppointmentSlot) : null;
  }

  static async findAvailableSlots(): Promise<AppointmentSlot[]> {
    const pool = getDbPool();
    // Return only future active slots where capacity is not exceeded
    const [rows]: any = await pool.execute(
      `SELECT id, DATE_FORMAT(start_time, '%Y-%m-%d %H:%i:%s') AS start_time,
              DATE_FORMAT(end_time, '%Y-%m-%d %H:%i:%s') AS end_time,
              max_capacity, current_bookings, is_active, created_by, created_at, updated_at
       FROM appointment_slots
       WHERE is_active = TRUE
         AND start_time > NOW()
         AND current_bookings < max_capacity
       ORDER BY start_time ASC`
    );
    return rows as AppointmentSlot[];
  }

  static async findAllSlots(): Promise<AppointmentSlot[]> {
    const pool = getDbPool();
    const [rows]: any = await pool.execute(
      `SELECT id, DATE_FORMAT(start_time, '%Y-%m-%d %H:%i:%s') AS start_time,
              DATE_FORMAT(end_time, '%Y-%m-%d %H:%i:%s') AS end_time,
              max_capacity, current_bookings, is_active, created_by, created_at, updated_at
       FROM appointment_slots
       ORDER BY start_time DESC`
    );
    return rows as AppointmentSlot[];
  }

  static async incrementBookings(id: number, connection: PoolConnection): Promise<boolean> {
    const [result]: any = await connection.execute(
      'UPDATE appointment_slots SET current_bookings = current_bookings + 1 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async decrementBookings(id: number, connection: PoolConnection): Promise<boolean> {
    const [result]: any = await connection.execute(
      'UPDATE appointment_slots SET current_bookings = GREATEST(0, current_bookings - 1) WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async toggleStatus(id: number, isActive: boolean): Promise<boolean> {
    const pool = getDbPool();
    const [result]: any = await pool.execute(
      'UPDATE appointment_slots SET is_active = ? WHERE id = ?',
      [isActive, id]
    );
    return result.affectedRows > 0;
  }
}

