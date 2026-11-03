import { request } from './api';
import { AppointmentSlot, DetailedAppointment, ApiResponse, AppointmentStatus } from '../types';

export const appointmentService = {
  async getAvailableSlots(): Promise<ApiResponse<AppointmentSlot[]>> {
    return request('/appointments/slots/available');
  },

  async getAllSlots(): Promise<ApiResponse<AppointmentSlot[]>> {
    return request('/appointments/slots');
  },

  async createSlot(data: {
    startTime: string;
    endTime: string;
    maxCapacity: number;
  }): Promise<ApiResponse<{ slotId: number }>> {
    return request('/appointments/slots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async toggleSlotStatus(slotId: number, isActive: boolean): Promise<ApiResponse> {
    return request(`/appointments/slots/${slotId}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  async bookAppointment(data: {
    slotId: number;
    testType: string;
  }): Promise<ApiResponse<{ appointmentId: number; bookingReference: string }>> {
    return request('/appointments/book', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyAppointments(): Promise<ApiResponse<DetailedAppointment[]>> {
    return request('/appointments/my');
  },

  async getAllAppointments(params?: {
    status?: AppointmentStatus;
    search?: string;
  }): Promise<ApiResponse<DetailedAppointment[]>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);

    const qs = searchParams.toString();
    return request(`/appointments${qs ? `?${qs}` : ''}`);
  },

  async cancelAppointment(appointmentId: number): Promise<ApiResponse> {
    return request(`/appointments/${appointmentId}/cancel`, {
      method: 'POST',
    });
  },

  async updateStatus(appointmentId: number, status: AppointmentStatus): Promise<ApiResponse> {
    return request(`/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

