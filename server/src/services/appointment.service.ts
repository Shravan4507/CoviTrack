import { withTransaction } from '../database/connection';
import { SlotRepository } from '../repositories/slot.repository';
import { AppointmentRepository, DetailedAppointment } from '../repositories/appointment.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { AppointmentSlot, AppointmentStatus } from '../types';

export class AppointmentService {
  static async createSlot(data: {
    startTime: string;
    endTime: string;
    maxCapacity: number;
    createdBy: number;
  }) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, error: 'Invalid date/time format for slot.' };
    }

    if (start <= now) {
      return { success: false, error: 'Slot start time must be in the future.' };
    }

    if (end <= start) {
      return { success: false, error: 'Slot end time must be after start time.' };
    }

    if (!data.maxCapacity || data.maxCapacity < 1 || data.maxCapacity > 500) {
      return { success: false, error: 'Slot capacity must be between 1 and 500.' };
    }

    const slotId = await SlotRepository.create({
      startTime: data.startTime,
      endTime: data.endTime,
      maxCapacity: data.maxCapacity,
      createdBy: data.createdBy,
    });

    await AuditRepository.log({
      userId: data.createdBy,
      action: 'SLOT_CREATED',
      entityType: 'SLOT',
      entityId: slotId,
      details: `Created slot #${slotId} with capacity ${data.maxCapacity}`,
    });

    return { success: true, slotId };
  }

  static async getAvailableSlots(): Promise<AppointmentSlot[]> {
    return SlotRepository.findAvailableSlots();
  }

  static async getAllSlots(): Promise<AppointmentSlot[]> {
    return SlotRepository.findAllSlots();
  }

  static async toggleSlotStatus(slotId: number, isActive: boolean, userId: number) {
    const slot = await SlotRepository.findById(slotId);
    if (!slot) {
      return { success: false, error: 'Slot not found.' };
    }
    const updated = await SlotRepository.toggleStatus(slotId, isActive);
    await AuditRepository.log({
      userId,
      action: 'SLOT_STATUS_TOGGLED',
      entityType: 'SLOT',
      entityId: slotId,
      details: `Slot #${slotId} set to active=${isActive}`,
    });
    return { success: updated };
  }

  static async bookAppointment(data: {
    patientId: number;
    slotId: number;
    testType?: string;
  }) {
    if (!data.slotId) {
      return { success: false, error: 'Please select an appointment slot.' };
    }

    const testType = data.testType?.trim() || 'RT-PCR';

    const result = await withTransaction(async (connection) => {
      // 1. Lock slot row for concurrent safety
      const slot = await SlotRepository.findByIdForUpdate(data.slotId, connection);
      if (!slot) {
        throw new Error('Selected slot does not exist.');
      }

      if (!slot.is_active) {
        throw new Error('This appointment slot is currently inactive.');
      }

      const slotStart = new Date(slot.start_time);
      if (slotStart <= new Date()) {
        throw new Error('Cannot book an appointment for a past slot.');
      }

      if (slot.current_bookings >= slot.max_capacity) {
        throw new Error('This appointment slot has reached maximum capacity.');
      }

      // 2. Prevent duplicate active booking for the same patient in this slot
      const existing = await AppointmentRepository.findExistingActiveBooking(
        data.patientId,
        data.slotId,
        connection
      );
      if (existing) {
        throw new Error('You already have an active appointment booked for this slot.');
      }

      // 3. Generate unique booking reference (COVI-BK-XXXXXX)
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const bookingReference = `COVI-BK-${randomSuffix}`;

      // 4. Increment slot booking count
      await SlotRepository.incrementBookings(data.slotId, connection);

      // 5. Create appointment
      const appointmentId = await AppointmentRepository.create(
        {
          patientId: data.patientId,
          slotId: data.slotId,
          testType,
          bookingReference,
          status: 'booked',
        },
        connection
      );

      return { appointmentId, bookingReference };
    });

    await AuditRepository.log({
      userId: data.patientId,
      action: 'APPOINTMENT_BOOKED',
      entityType: 'APPOINTMENT',
      entityId: result.appointmentId,
      details: `Booked appointment #${result.appointmentId} (${result.bookingReference})`,
    });

    return {
      success: true,
      data: result,
    };
  }

  static async cancelAppointment(appointmentId: number, requestingUserId: number, requestingRole: string) {
    const appt = await AppointmentRepository.findById(appointmentId);
    if (!appt) {
      return { success: false, error: 'Appointment not found.' };
    }

    // Role check: patient can only cancel their own appointment
    if (requestingRole === 'patient' && appt.patientId !== requestingUserId) {
      return { success: false, error: 'Unauthorized to cancel this appointment.' };
    }

    if (appt.status === 'cancelled') {
      return { success: false, error: 'Appointment is already cancelled.' };
    }

    if (appt.status === 'completed') {
      return { success: false, error: 'Completed appointments cannot be cancelled.' };
    }

    await withTransaction(async (connection) => {
      await AppointmentRepository.updateStatus(appointmentId, 'cancelled', connection);
      await SlotRepository.decrementBookings(appt.slotId, connection);
    });

    await AuditRepository.log({
      userId: requestingUserId,
      action: 'APPOINTMENT_CANCELLED',
      entityType: 'APPOINTMENT',
      entityId: appointmentId,
      details: `Cancelled appointment #${appointmentId} by ${requestingRole}`,
    });

    return { success: true, message: 'Appointment cancelled successfully.' };
  }

  static async updateAppointmentStatus(
    appointmentId: number,
    newStatus: AppointmentStatus,
    staffUserId: number
  ) {
    const appt = await AppointmentRepository.findById(appointmentId);
    if (!appt) {
      return { success: false, error: 'Appointment not found.' };
    }

    if (appt.status === 'cancelled') {
      return { success: false, error: 'Cannot update status of a cancelled appointment.' };
    }

    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      booked: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[appt.status]?.includes(newStatus)) {
      return {
        success: false,
        error: `Invalid status transition from '${appt.status}' to '${newStatus}'.`,
      };
    }

    await AppointmentRepository.updateStatus(appointmentId, newStatus);

    await AuditRepository.log({
      userId: staffUserId,
      action: 'APPOINTMENT_STATUS_UPDATED',
      entityType: 'APPOINTMENT',
      entityId: appointmentId,
      details: `Appointment status updated from ${appt.status} to ${newStatus}`,
    });

    return { success: true, message: `Status updated to ${newStatus}.` };
  }

  static async getPatientAppointments(patientId: number): Promise<DetailedAppointment[]> {
    return AppointmentRepository.findByPatientId(patientId);
  }

  static async getAppointments(filters?: {
    status?: AppointmentStatus;
    search?: string;
  }): Promise<DetailedAppointment[]> {
    return AppointmentRepository.findAll(filters);
  }
}

