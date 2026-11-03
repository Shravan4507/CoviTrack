import { request } from './api';
import { ApiResponse, PatientDetailedView } from '../types';

export const patientService = {
  async getDashboard(): Promise<ApiResponse<any>> {
    return request('/patient/dashboard');
  },

  async searchPatients(query?: string): Promise<ApiResponse<PatientDetailedView[]>> {
    const qs = query ? `?q=${encodeURIComponent(query)}` : '';
    return request(`/patient/search${qs}`);
  },

  async getPatientDetails(id: number): Promise<ApiResponse<any>> {
    return request(`/patient/${id}`);
  },
};

