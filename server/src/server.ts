import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { createApp } from './app';
import { testConnection } from './database/connection';

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '127.0.0.1';

const app = createApp();

const startServer = async () => {
  console.log('====================================================');
  console.log(' CoviTrack API Server Initializing...');
  console.log('====================================================');

  const isDbConnected = await testConnection();
  if (isDbConnected) {
    console.log(`[Database] Successfully connected to MySQL at ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || '3306'}`);
  } else {
    console.warn(`[Database Notice] MySQL server is currently not reachable.`);
    console.warn(`[Database Setup] Please ensure MySQL or XAMPP MySQL service is running on ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || '3306'}.`);
    console.warn(`[Database Setup] Run 'npm run db:migrate' to initialize the database tables once MySQL is active.`);
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`[CoviTrack Server] Listening on http://${HOST}:${PORT}`);
    console.log(`[CoviTrack Server] Health check available at http://${HOST}:${PORT}/api/health`);
    console.log('====================================================');
  });

  const shutdown = () => {
    console.log('[CoviTrack Server] Gracefully shutting down...');
    server.close(() => {
      console.log('[CoviTrack Server] Closed active connections. Server terminated.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer();

