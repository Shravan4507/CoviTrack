import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { AccountStatus, UserRole } from '../types';

export class AdminController {
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const logs = await AdminService.getAuditLogs(limit);
      res.status(200).json({ success: true, data: logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const role = req.query.role as UserRole | undefined;
      const status = req.query.status as AccountStatus | undefined;
      const users = await AdminService.getAllUsers({ role, status });
      res.status(200).json({ success: true, data: users });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async createStaff(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email, mobileNumber, password } = req.body;
      const adminUserId = req.user!.userId;

      const result = await AdminService.createStaffUser({
        fullName,
        email,
        mobileNumber,
        password,
        adminUserId,
      });

      if (!result.success) {
        res.status(400).json({
          success: false,
          errors: result.errors,
          error: Object.values(result.errors || {})[0] || 'Validation failed.',
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Staff account created successfully.',
        data: result.data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const targetUserId = parseInt(req.params.id, 10);
      const { status } = req.body;

      if (isNaN(targetUserId) || !status) {
        res.status(400).json({ success: false, error: 'Valid user ID and status are required.' });
        return;
      }

      const result = await AdminService.updateUserStatus(
        targetUserId,
        status as AccountStatus,
        req.user!.userId
      );

      if (!result.success) {
        res.status(400).json({ success: false, error: result.error || 'Failed to update user status.' });
        return;
      }

      res.status(200).json({ success: true, message: 'User status updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

