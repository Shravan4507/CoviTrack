import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { withTransaction } from '../database/connection';
import { UserRepository } from '../repositories/user.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { AuthTokenPayload, UserRole } from '../types';
import {
  isValidFullName,
  isValidEmail,
  isValidMobileNumber,
  isValidDateFormat,
  isValidIsoDate,
  formatDdmmyyyyToIso,
  isValidPassword,
} from '../validators/regex.validators';

export class AuthService {
  private static getJwtSecret(): string {
    return process.env.JWT_SECRET || 'covitrack_default_secret_academic_key';
  }

  static generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.getJwtSecret(), {
      expiresIn: '24h',
    });
  }

  static verifyToken(token: string): AuthTokenPayload | null {
    try {
      return jwt.verify(token, this.getJwtSecret()) as AuthTokenPayload;
    } catch {
      return null;
    }
  }

  static async registerPatient(data: {
    fullName: string;
    email: string;
    mobileNumber: string;
    dateOfBirth: string;
    address: string;
    password: string;
    confirmPassword: string;
    ipAddress?: string;
  }) {
    const errors: Record<string, string> = {};

    // 1. Mandatory & Regex Validations
    if (!data.fullName || !isValidFullName(data.fullName)) {
      errors.fullName = 'Full name must be 3-50 alphabetical characters and spaces only.';
    }

    if (!data.email || !isValidEmail(data.email)) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!data.mobileNumber || !isValidMobileNumber(data.mobileNumber)) {
      errors.mobileNumber = 'Mobile number must be exactly 10 numeric digits.';
    }

    let isoDob = '';
    if (!data.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required.';
    } else if (isValidIsoDate(data.dateOfBirth)) {
      isoDob = data.dateOfBirth.trim();
    } else if (isValidDateFormat(data.dateOfBirth)) {
      isoDob = formatDdmmyyyyToIso(data.dateOfBirth);
    } else {
      errors.dateOfBirth = 'Date of birth must be a valid calendar date (DD-MM-YYYY or YYYY-MM-DD).';
    }

    if (isoDob) {
      const dobDate = new Date(isoDob);
      const today = new Date();
      if (dobDate >= today) {
        errors.dateOfBirth = 'Date of birth must be in the past.';
      }
    }

    if (!data.address || data.address.trim().length < 5) {
      errors.address = 'Address must be at least 5 characters long.';
    }

    if (!data.password || !isValidPassword(data.password)) {
      errors.password = 'Password must be at least 8 characters long and contain letters and numbers.';
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Password and confirmation password do not match.';
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    // 2. Uniqueness Checks
    const existingEmail = await UserRepository.findByEmail(data.email);
    if (existingEmail) {
      return { success: false, errors: { email: 'An account with this email address already exists.' } };
    }

    const existingMobile = await UserRepository.findByMobile(data.mobileNumber);
    if (existingMobile) {
      return { success: false, errors: { mobileNumber: 'An account with this mobile number already exists.' } };
    }

    // 3. Password Hashing & Transactional Record Insertion
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const result = await withTransaction(async (connection) => {
      const userId = await UserRepository.create(
        {
          fullName: data.fullName,
          email: data.email,
          mobileNumber: data.mobileNumber,
          passwordHash,
          role: 'patient',
          status: 'active',
        },
        connection
      );

      // Generate unique patient identification number (PT-YYYY-XXXXX)
      const currentYear = new Date().getFullYear();
      const randomSeq = Math.floor(10000 + Math.random() * 90000);
      const patientIdNumber = `PT-${currentYear}-${randomSeq}`;

      await PatientRepository.create(
        {
          userId,
          patientIdNumber,
          dateOfBirth: isoDob,
          address: data.address,
        },
        connection
      );

      return { userId, patientIdNumber };
    });

    await AuditRepository.log({
      userId: result.userId,
      action: 'PATIENT_REGISTERED',
      entityType: 'USER',
      entityId: result.userId,
      ipAddress: data.ipAddress,
      details: `New patient registered with ID ${result.patientIdNumber}`,
    });

    return {
      success: true,
      data: {
        userId: result.userId,
        patientIdNumber: result.patientIdNumber,
        fullName: data.fullName,
        email: data.email,
      },
    };
  }

  static async login(data: {
    email: string;
    password: string;
    ipAddress?: string;
  }) {
    if (!data.email || !data.password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const user = await UserRepository.findByEmail(data.email);
    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    if (user.account_status !== 'active') {
      return { success: false, error: 'Your account is deactivated or suspended. Please contact administrator.' };
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Check if patient profile exists
    let patientIdNumber: string | undefined;
    if (user.role === 'patient') {
      const profile = await PatientRepository.findByUserId(user.id);
      patientIdNumber = profile?.patient_id_number;
    }

    const tokenPayload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    };

    const token = this.generateToken(tokenPayload);

    await AuditRepository.log({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'AUTH',
      entityId: user.id,
      ipAddress: data.ipAddress,
      details: `User logged in with role ${user.role}`,
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        mobileNumber: user.mobile_number,
        role: user.role,
        patientIdNumber,
      },
    };
  }
}

