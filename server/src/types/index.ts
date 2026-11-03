export type UserRole = 'patient' | 'staff' | 'admin';
export type AccountStatus = 'active' | 'inactive' | 'suspended';
export type AppointmentStatus = 'booked' | 'confirmed' | 'completed' | 'cancelled';
export type DiagnosticResult = 'positive' | 'negative' | 'inconclusive';

export interface User {
  id: number;
  full_name: string;
  email: string;
  mobile_number: string;
  password_hash: string;
  role: UserRole;
  account_status: AccountStatus;
  created_at: Date;
  updated_at: Date;
}

export interface PatientProfile {
  id: number;
  user_id: number;
  patient_id_number: string;
  date_of_birth: string;
  address: string;
  created_at: Date;
  updated_at: Date;
}

export interface AppointmentSlot {
  id: number;
  start_time: Date | string;
  end_time: Date | string;
  max_capacity: number;
  current_bookings: number;
  is_active: boolean;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface Appointment {
  id: number;
  patient_id: number;
  slot_id: number;
  test_type: string;
  booking_reference: string;
  status: AppointmentStatus;
  created_at: Date;
  updated_at: Date;
}

export interface DiagnosticReport {
  id: number;
  appointment_id: number;
  patient_id: number;
  report_reference: string;
  test_result: DiagnosticResult;
  testing_date: string;
  staff_id: number;
  notes?: string;
  pdf_path?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  action: string;
  entity_type: string;
  entity_id?: number | null;
  ip_address?: string;
  details?: string;
  created_at: Date;
}

export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

