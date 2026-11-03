import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'covitrack',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  timezone: '+00:00',
  multipleStatements: true,
};

let pool: Pool | null = null;

export const getDbPool = (): Pool => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await getDbPool().getConnection();
    connection.release();
    return true;
  } catch (error: any) {
    console.warn(`[Database Warning] Unable to connect to MySQL database '${dbConfig.database}' on ${dbConfig.host}:${dbConfig.port}.`);
    console.warn(`[Database Message] ${error.message}`);
    return false;
  }
};

export const withTransaction = async <T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> => {
  const pool = getDbPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default getDbPool;

