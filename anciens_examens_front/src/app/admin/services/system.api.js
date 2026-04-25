import api from '@/api/api';

export const systemApi = {
  // Logs et audit
  getAuditLogs: async (params = {}) => {
    const { page = 1, limit = 50, action, userId, startDate, endDate } = params;
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(action && { action }),
      ...(userId && { userId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    });
    const response = await api.get(`/admin/audit-logs?${queryParams}`);
    return response.data;
  },

  getSystemLogs: async (params = {}) => {
    const { page = 1, limit = 50, level, startDate, endDate } = params;
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(level && { level }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    });
    const response = await api.get(`/admin/system-logs?${queryParams}`);
    return response.data;
  },

  // Backup et maintenance
  createBackup: async () => {
    const response = await api.post('/admin/backup/create');
    return response.data;
  },

  getBackups: async () => {
    const response = await api.get('/admin/backup/list');
    return response.data;
  },

  restoreBackup: async (backupId) => {
    const response = await api.post(`/admin/backup/restore/${backupId}`);
    return response.data;
  }
};
