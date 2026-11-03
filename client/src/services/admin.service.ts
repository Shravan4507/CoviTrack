import { request } from './api';
import { ApiResponse, SystemStats, UserRole, AccountStatus } from '../types';

export const adminService = {
  async getStats(): Promise<ApiResponse<SystemStats>> {
    return request('/admin/stats');
  },

  async getAuditLogs(limit = 100): Promise<ApiResponse<any[]>> {
    return request(`/admin/audit-logs?limit=${limit}`);
  },

  async getAllUsers(params?: {
    role?: UserRole;
    status?: AccountStatus;
  }): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set('role', params.role);
    if (params?.status) searchParams.set('status', params.status);

    const qs = searchParams.toString();
    return request(`/admin/users${qs ? `?${qs}` : ''}`);
  },

  async createStaff(data: {
    fullName: string;
    email: string;
    mobileNumber: string;
    password: string;
  }): Promise<ApiResponse<any>> {
    return request('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async toggleUserStatus(userId: number, status: AccountStatus): Promise<ApiResponse> {
    return request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

