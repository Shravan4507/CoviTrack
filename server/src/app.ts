import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';
import appointmentRoutes from './routes/appointment.routes';
import reportRoutes from './routes/report.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/error.middleware';

export const createApp = (): Application => {
  const app = express();

  // CORS Configuration
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173';
  app.use(
    cors({
      origin: [clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // System Health Check Endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      status: 'UP',
      service: 'CoviTrack API Server',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/patient', patientRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 Route Handler
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `API Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export default createApp;

