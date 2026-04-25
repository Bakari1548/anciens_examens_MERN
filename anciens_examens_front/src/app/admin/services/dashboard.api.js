import api from '@/api/api';

export const dashboardApi = {
  // Dashboard et statistiques
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getAnalytics: async (period = '7d') => {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data;
  }
};
