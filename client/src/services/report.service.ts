import { request } from './api';
import { DetailedReport, ApiResponse, DiagnosticResult } from '../types';

export const reportService = {
  async createReport(data: {
    appointmentId: number;
    testResult: DiagnosticResult;
    testingDate: string;
    notes?: string;
  }): Promise<ApiResponse<{ reportId: number; reportReference: string }>> {
    return request('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyReports(): Promise<ApiResponse<DetailedReport[]>> {
    return request('/reports/my');
  },

  async getAllReports(params?: {
    result?: DiagnosticResult;
    search?: string;
  }): Promise<ApiResponse<DetailedReport[]>> {
    const searchParams = new URLSearchParams();
    if (params?.result) searchParams.set('result', params.result);
    if (params?.search) searchParams.set('search', params.search);

    const qs = searchParams.toString();
    return request(`/reports${qs ? `?${qs}` : ''}`);
  },

  async getReportById(id: number): Promise<ApiResponse<DetailedReport>> {
    return request(`/reports/${id}`);
  },

  getReportPdfUrl(id: number): string {
    return `/api/reports/${id}/pdf`;
  },
};

