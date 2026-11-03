import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import path from 'path';
import dotenv from 'dotenv';
import { isValidFullName, isValidEmail, isValidMobileNumber, isValidPassword } from '../validators/regex.validators';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const host = process.env.DB_HOST || '127.0.0.1';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'covitrack';

const parseArgs = (): Record<string, string> => {
  const args: Record<string, string> = {};
  for (let i = 2; i < process.argv.length; i++) {
      const arg = process.argv[i];
      if (arg.startsWith('--')) {
        const key = arg.replace(/^--/, '');
        const nextArg = process.argv[i + 1];
        if (nextArg && !nextArg.startsWith('--')) {
          args[key] = nextArg;
          i++;
        } else {
          args[key] = 'true';
        }
      }
    }
    return args;
  };

  async function createAdmin() {
    console.log('====================================================');
    console.log(' CoviTrack - Administrator Provisioning CLI');
    console.log('====================================================');

    const args = parseArgs();
    const fullName = args.name || process.env.ADMIN_NAME || 'Super Administrator';
    const email = (args.email || process.env.ADMIN_EMAIL || 'admin@covitrack.local').toLowerCase().trim();
    const mobile = args.mobile || process.env.ADMIN_MOBILE || '9876543210';
    const adminPassword = args.password || process.env.ADMIN_PASSWORD || 'AdminPass123!';

    if (!isValidFullName(fullName)) {
      console.error('Error: Invalid full name. Must be 3-50 alphabetical characters.');
      process.exit(1);
    }

    if (!isValidEmail(email)) {
      console.error('Error: Invalid email format.');
      process.exit(1);
    }

    if (!isValidMobileNumber(mobile)) {
      console.error('Error: Invalid mobile number. Must be exactly 10 digits.');
      process.exit(1);
    }

    if (!isValidPassword(adminPassword)) {
      console.error('Error: Password must be at least 8 characters long and contain letters and digits.');
      process.exit(1);
    }

    let connection;
    try {
      connection = await mysql.createConnection({
        host,
        port,
        user,
        password,
        database,
      });

      const [existing]: any = await connection.execute(
        'SELECT id, email, role FROM users WHERE email = ? OR mobile_number = ?',
        [email, mobile]
      );

      if (existing.length > 0) {
        console.log(`[Notice] Administrator account already exists (ID: #${existing[0].id}, Email: ${existing[0].email}).`);
        process.exit(0);
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      const [result]: any = await connection.execute(
        `INSERT INTO users (full_name, email, mobile_number, password_hash, role, account_status)
       VALUES (?, ?, ?, ?, 'admin', 'active')`,
        [fullName, email, mobile, passwordHash]
      );

      console.log(`[Success] Administrator account provisioned successfully!`);
      console.log(`  Admin ID: #${result.insertId}`);
      console.log(`  Email:    ${email}`);
      console.log(`  Mobile:   ${mobile}`);
      console.log(`  Password: ${adminPassword}`);
      console.log(`  Role:     admin`);
    } catch (error: any) {
      console.error(`[Admin Creation Failed]: ${error.message}`);
      process.exit(1);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  createAdmin();
