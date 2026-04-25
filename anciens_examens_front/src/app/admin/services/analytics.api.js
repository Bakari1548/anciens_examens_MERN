import api from '@/api/api';

export const analyticsApi = {
  // Analytics et statistiques détaillées
  getAnalytics: async (period = '7d') => {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data;
  },

  // Rapports et exports
  generateReport: async (type, params = {}) => {
    const response = await api.post(`/admin/reports/generate/${type}`, params);
    return response.data;
  },

  getReportsList: async () => {
    const response = await api.get('/admin/reports/list');
    return response.data;
  },

  downloadReport: async (reportId) => {
    const response = await api.get(`/admin/reports/download/${reportId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
