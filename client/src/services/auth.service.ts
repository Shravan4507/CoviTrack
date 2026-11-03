import { request } from './api';
import { User, ApiResponse } from '../types';

export const authService = {
  async register(data: {
    fullName: string;
    email: string;
    mobileNumber: string;
    dateOfBirth: string;
    address: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async logout(): Promise<ApiResponse> {
    return request('/auth/logout', {
      method: 'POST',
    });
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return request('/auth/me', {
      method: 'GET',
    });
  },
};

