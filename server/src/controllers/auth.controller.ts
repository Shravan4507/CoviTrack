import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { PatientRepository } from '../repositories/patient.repository';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email, mobileNumber, dateOfBirth, address, password, confirmPassword } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;

      const result = await AuthService.registerPatient({
        fullName,
        email,
        mobileNumber,
        dateOfBirth,
        address,
        password,
        confirmPassword,
        ipAddress,
      });

      if (!result.success) {
        res.status(400).json({
          success: false,
          errors: result.errors,
          error: Object.values(result.errors || {})[0] || 'Registration validation failed.',
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful. You can now log in.',
        data: result.data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;

      const result = await AuthService.login({ email, password, ipAddress });

      if (!result.success || !result.token) {
        res.status(401).json({
          success: false,
          error: result.error || 'Authentication failed.',
        });
        return;
      }

      // Secure HTTP-Only Cookie
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('covitrack_token', result.token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('covitrack_token', {
      httpOnly: true,
      sameSite: 'lax',
    });
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  }

  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated.' });
        return;
      }

      const user = await UserRepository.findById(req.user.userId);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found.' });
        return;
      }

      let patientProfile = null;
      if (user.role === 'patient') {
        patientProfile = await PatientRepository.findByUserId(user.id);
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          mobileNumber: user.mobile_number,
          role: user.role,
          accountStatus: user.account_status,
          createdAt: user.created_at,
          patientProfile: patientProfile
            ? {
                patientIdNumber: patientProfile.patient_id_number,
                dateOfBirth: patientProfile.date_of_birth,
                address: patientProfile.address,
              }
            : null,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

