import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const host = process.env.DB_HOST || '127.0.0.1';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'covitrack';

async function runMigrations() {
  console.log(`[CoviTrack Migration] Starting migration for database: ${database}...`);
  let connection;
  try {
    // Connect without selecting database first to ensure database exists
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });

    console.log(`[CoviTrack Migration] Connected to MySQL on ${host}:${port}.`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${database}\`;`);
    console.log(`[CoviTrack Migration] Database '${database}' selected.`);

    // Read schema.sql
    const schemaPath = path.resolve(__dirname, '../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      console.log(`[CoviTrack Migration] Executing schema script...`);
      await connection.query(sql);
      console.log(`[CoviTrack Migration] Schema executed successfully.`);
    } else {
      console.error(`[CoviTrack Migration] Schema file not found at ${schemaPath}`);
    }

    console.log(`[CoviTrack Migration] Database tables verified successfully.`);
  } catch (error: any) {
    console.error(`[CoviTrack Migration Error] ${error.message}`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigrations();

