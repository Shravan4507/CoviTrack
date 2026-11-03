export type UserRole = 'patient' | 'staff' | 'admin';
export type AccountStatus = 'active' | 'inactive' | 'suspended';
export type AppointmentStatus = 'booked' | 'confirmed' | 'completed' | 'cancelled';
export type DiagnosticResult = 'positive' | 'negative' | 'inconclusive';

export interface User {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
  patientProfile?: {
    patientIdNumber: string;
    dateOfBirth: string;
    address: string;
  } | null;
}

export interface AppointmentSlot {
  id: number;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_bookings: number;
  is_active: boolean;
  created_by: number;
}

export interface DetailedAppointment {
  id: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  patientMobile: string;
  patientIdNumber?: string;
  slotId: number;
  slotStartTime: string;
  slotEndTime: string;
  testType: string;
  bookingReference: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  hasReport?: boolean;
}

export interface DetailedReport {
  id: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  patientMobile: string;
  patientIdNumber?: string;
  dateOfBirth?: string;
  address?: string;
  testType: string;
  bookingReference: string;
  reportReference: string;
  testResult: DiagnosticResult;
  testingDate: string;
  staffId: number;
  staffName: string;
  notes?: string;
  pdfPath?: string;
  createdAt: string;
}

export interface PatientDetailedView {
  userId: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  patientIdNumber: string;
  dateOfBirth: string;
  address: string;
  accountStatus: string;
  createdAt: string;
  appointmentCount?: number;
  reportCount?: number;
}

export interface SystemStats {
  users: {
    totalPatients: number;
    totalStaff: number;
    totalAdmins: number;
  };
  appointments: {
    totalAppointments: number;
    bookedAppointments: number;
    confirmedAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
  };
  reports: {
    totalReports: number;
    positiveReports: number;
    negativeReports: number;
    inconclusiveReports: number;
  };
  slots: {
    totalSlots: number;
    upcomingActiveSlots: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

