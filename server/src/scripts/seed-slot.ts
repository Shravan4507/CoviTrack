import mysql from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const host = process.env.DB_HOST || '127.0.0.1';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'covitrack';

async function seedInitialSlot() {
  let connection;
  try {
    connection = await mysql.createConnection({ host, port, user, password, database });

    // Check if slots exist
    const [slots]: any = await connection.execute('SELECT id FROM appointment_slots WHERE is_active = TRUE AND start_time > NOW()');
    if (slots.length > 0) {
      console.log(`[Notice] Active testing slots already exist (${slots.length} available).`);
      return;
    }

    // Find admin or staff user ID
    const [users]: any = await connection.execute('SELECT id FROM users WHERE role IN ("admin", "staff") LIMIT 1');
    const createdBy = users.length > 0 ? users[0].id : 1;

    // Create tomorrow's slots
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;

    await connection.execute(
      `INSERT INTO appointment_slots (start_time, end_time, max_capacity, current_bookings, is_active, created_by)
       VALUES (?, ?, 30, 0, TRUE, ?)`,
      [`${dateStr} 09:00:00`, `${dateStr} 12:00:00`, createdBy]
    );

    await connection.execute(
      `INSERT INTO appointment_slots (start_time, end_time, max_capacity, current_bookings, is_active, created_by)
       VALUES (?, ?, 30, 0, TRUE, ?)`,
      [`${dateStr} 14:00:00`, `${dateStr} 17:00:00`, createdBy]
    );

    console.log('[Success] Initial testing center slots seeded for tomorrow (09:00-12:00 and 14:00-17:00).');
  } catch (err: any) {
    console.warn(`[Slot Seed Warning] ${err.message}`);
  } finally {
    if (connection) await connection.end();
  }
}

seedInitialSlot();

