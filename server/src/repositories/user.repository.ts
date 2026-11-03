import { PoolConnection } from 'mysql2/promise';
import { getDbPool } from '../database/connection';
import { User, UserRole, AccountStatus } from '../types';

export class UserRepository {
  static async findById(id: number, connection?: PoolConnection): Promise<User | null> {
    const conn = connection || (getDbPool() as any);
    const [rows]: any = await conn.execute(
      'SELECT id, full_name, email, mobile_number, password_hash, role, account_status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  static async findByEmail(email: string, connection?: PoolConnection): Promise<User | null> {
    const conn = connection || (getDbPool() as any);
    const [rows]: any = await conn.execute(
      'SELECT id, full_name, email, mobile_number, password_hash, role, account_status, created_at, updated_at FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  static async findByMobile(mobileNumber: string, connection?: PoolConnection): Promise<User | null> {
    const conn = connection || (getDbPool() as any);
    const [rows]: any = await conn.execute(
      'SELECT id, full_name, email, mobile_number, password_hash, role, account_status, created_at, updated_at FROM users WHERE mobile_number = ?',
      [mobileNumber.trim()]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  static async create(
    user: {
      fullName: string;
      email: string;
      mobileNumber: string;
      passwordHash: string;
      role: UserRole;
      status?: AccountStatus;
    },
    connection?: PoolConnection
  ): Promise<number> {
    const conn = connection || (getDbPool() as any);
    const [result]: any = await conn.execute(
      `INSERT INTO users (full_name, email, mobile_number, password_hash, role, account_status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user.fullName.trim(),
        user.email.toLowerCase().trim(),
        user.mobileNumber.trim(),
        user.passwordHash,
        user.role,
        user.status || 'active',
      ]
    );
    return result.insertId;
  }

  static async findAll(filters?: { role?: UserRole; status?: AccountStatus }): Promise<Omit<User, 'password_hash'>[]> {
    const pool = getDbPool();
    let query = 'SELECT id, full_name, email, mobile_number, role, account_status, created_at, updated_at FROM users';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters?.role) {
      conditions.push('role = ?');
      params.push(filters.role);
    }
    if (filters?.status) {
      conditions.push('account_status = ?');
      params.push(filters.status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const [rows]: any = await pool.execute(query, params);
    return rows;
  }

  static async updateStatus(id: number, status: AccountStatus): Promise<boolean> {
    const pool = getDbPool();
    const [result]: any = await pool.execute(
      'UPDATE users SET account_status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }
}

