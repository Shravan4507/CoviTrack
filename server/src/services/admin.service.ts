import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { AccountStatus, UserRole } from '../types';
import {
  isValidFullName,
  isValidEmail,
  isValidMobileNumber,
  isValidPassword,
} from '../validators/regex.validators';

export class AdminService {
  static async getDashboardStats() {
    return AuditRepository.getSystemStatistics();
  }

  static async getAuditLogs(limit = 100) {
    return AuditRepository.findRecent(limit);
  }

  static async getAllUsers(filters?: { role?: UserRole; status?: AccountStatus }) {
    return UserRepository.findAll(filters);
  }

  static async createStaffUser(data: {
    fullName: string;
    email: string;
    mobileNumber: string;
    password: string;
    adminUserId: number;
  }) {
    const errors: Record<string, string> = {};

    if (!data.fullName || !isValidFullName(data.fullName)) {
      errors.fullName = 'Full name must be 3-50 alphabetical characters and spaces only.';
    }

    if (!data.email || !isValidEmail(data.email)) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!data.mobileNumber || !isValidMobileNumber(data.mobileNumber)) {
      errors.mobileNumber = 'Mobile number must be exactly 10 numeric digits.';
    }

    if (!data.password || !isValidPassword(data.password)) {
      errors.password = 'Password must be at least 8 characters long and contain letters and numbers.';
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    const existingEmail = await UserRepository.findByEmail(data.email);
    if (existingEmail) {
      return { success: false, errors: { email: 'An account with this email address already exists.' } };
    }

    const existingMobile = await UserRepository.findByMobile(data.mobileNumber);
    if (existingMobile) {
      return { success: false, errors: { mobileNumber: 'An account with this mobile number already exists.' } };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const userId = await UserRepository.create({
      fullName: data.fullName,
      email: data.email,
      mobileNumber: data.mobileNumber,
      passwordHash,
      role: 'staff',
      status: 'active',
    });

    await AuditRepository.log({
      userId: data.adminUserId,
      action: 'STAFF_CREATED',
      entityType: 'USER',
      entityId: userId,
      details: `Created staff member ${data.fullName} (${data.email})`,
    });

    return {
      success: true,
      data: {
        userId,
        fullName: data.fullName,
        email: data.email,
        role: 'staff',
      },
    };
  }

  static async updateUserStatus(userId: number, status: AccountStatus, adminUserId: number) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    if (user.id === adminUserId) {
      return { success: false, error: 'Administrators cannot change their own status.' };
    }

    const updated = await UserRepository.updateStatus(userId, status);
    if (updated) {
      await AuditRepository.log({
        userId: adminUserId,
        action: 'USER_STATUS_UPDATED',
        entityType: 'USER',
        entityId: userId,
        details: `Updated user #${userId} (${user.email}) status to ${status}`,
      });
    }

    return { success: updated };
  }
}

