import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function tryConnect(port: number, user = 'root', password = ''): Promise<boolean> {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: '127.0.0.1',
      port,
      user,
      password,
      connectTimeout: 2000,
    });
    await conn.query('SELECT 1');
    return true;
  } catch (err: any) {
    return false;
  } finally {
    if (conn) {
      try { await conn.end(); } catch {}
    }
  }
}

function updateEnvFile(port: number) {
  const examplePath = path.resolve(__dirname, '../../.env.example');
  let content = '';

  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  } else if (fs.existsSync(examplePath)) {
    content = fs.readFileSync(examplePath, 'utf8');
  } else {
    content = `PORT=5000\nNODE_ENV=development\nDB_HOST=127.0.0.1\nDB_PORT=3306\nDB_USER=root\nDB_PASSWORD=\nDB_NAME=covitrack\n`;
  }

  if (content.includes('DB_PORT=')) {
    content = content.replace(/DB_PORT=\d+/g, `DB_PORT=${port}`);
  } else {
    content += `\nDB_PORT=${port}\n`;
  }

  fs.writeFileSync(envPath, content, 'utf8');
}

async function setupDatabase() {
  const defaultPort = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';

  console.log(`[DB Setup] Testing MySQL connectivity on 127.0.0.1:${defaultPort}...`);

  const canConnectDefault = await tryConnect(defaultPort, user, password);

  if (canConnectDefault) {
    console.log(`[DB Setup] Successfully connected to existing MySQL on port ${defaultPort}.`);
    updateEnvFile(defaultPort);
    await ensureDatabases(defaultPort, user, password);
    process.exit(0);
  }

  // If port 3306 failed (refused or access denied):
  console.warn(`[DB Setup] Port ${defaultPort} is either unavailable or requires credentials.`);
  console.log(`[DB Setup] Checking dedicated isolated port 3307 for portable MariaDB...`);

  const canConnect3307 = await tryConnect(3307, 'root', '');
  if (canConnect3307) {
    console.log(`[DB Setup] Connected to active portable MariaDB on port 3307.`);
    updateEnvFile(3307);
    await ensureDatabases(3307, 'root', '');
    process.exit(0);
  }

  // Neither 3306 nor 3307 are accessible
  // Signal to the runner script (exit code 2) that portable MariaDB must be started on port 3307
  console.log(`[DB Setup] Requesting runner to boot portable MariaDB on port 3307...`);
  updateEnvFile(3307);
  process.exit(2);
}

async function ensureDatabases(port: number, user: string, pass: string) {
  let conn;
  try {
    conn = await mysql.createConnection({ host: '127.0.0.1', port, user, password: pass });
    await conn.query('CREATE DATABASE IF NOT EXISTS `covitrack` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    await conn.query('CREATE DATABASE IF NOT EXISTS `covitrack_test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    console.log(`[DB Setup] Verified databases 'covitrack' and 'covitrack_test' on port ${port}.`);
  } catch (err: any) {
    console.error(`[DB Setup Error] Failed to create databases: ${err.message}`);
    process.exit(1);
  } finally {
    if (conn) {
      try { await conn.end(); } catch {}
    }
  }
}

setupDatabase().catch((err) => {
  console.error(`[DB Setup Fatal] ${err.message}`);
  process.exit(1);
});

