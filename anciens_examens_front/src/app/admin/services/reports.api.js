import api from '@/api/api';

export const reportsApi = {
  // Modération et signalements
  getReports: async (params = {}) => {
    const { page = 1, limit = 20, status, type } = params;
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(type && { type })
    });
    const response = await api.get(`/admin/reports?${queryParams}`);
    return response.data;
  },

  getReportById: async (reportId) => {
    const response = await api.get(`/admin/reports/${reportId}`);
    return response.data;
  },

  resolveReport: async (reportId, resolution) => {
    const response = await api.patch(`/admin/reports/${reportId}/resolve`, { resolution });
    return response.data;
  }
};
