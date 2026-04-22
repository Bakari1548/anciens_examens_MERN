import api from '@/api/api';

export const adminApi = {
  // Vérifier le statut admin
  checkAdminStatus: async () => {
    const response = await api.get('users/profile');
    return response;
  },

  // Dashboard et statistiques
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getAnalytics: async (period = '7d') => {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data;
  },

  // Gestion des utilisateurs
  getUsers: async (params = {}) => {
    const { page = 1, limit = 20, search, role, status } = params;
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(role && { role }),
      ...(status && { status })
    });
    const response = await api.get(`/admin/users?${queryParams}`);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  exportUsers: async (format = 'csv') => {
    const response = await api.get(`/admin/users/export?format=${format}`);
    return response.data;
  },

  // Gestion des examens
  getExams: async (params = {}) => {
    const { page = 1, limit = 20, search, status, ufr, filiere } = params;
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(status && { status }),
      ...(ufr && { ufr }),
      ...(filiere && { filiere })
    });
    const response = await api.get(`/admin/exams?${queryParams}`);
    return response.data;
  },

  getExamById: async (examId) => {
    const response = await api.get(`/admin/exams/${examId}`);
    return response.data;
  },

  approveExam: async (examId) => {
    const response = await api.patch(`/admin/exams/${examId}/approve`);
    return response.data;
  },

  rejectExam: async (examId, reason) => {
    const response = await api.patch(`/admin/exams/${examId}/reject`, { reason });
    return response.data;
  },

  deleteExam: async (examId) => {
    const response = await api.delete(`/admin/exams/${examId}`);
    return response.data;
  },

  // Modération
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
  },

  banUser: async (userId, duration, reason) => {
    const response = await api.post(`/admin/users/${userId}/ban`, { duration, reason });
    return response.data;
  },

  unbanUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/unban`);
    return response.data;
  },

  // Notifications et communications
  sendGlobalNotification: async (notification) => {
    const response = await api.post('/admin/notifications/global', notification);
    return response.data;
  },

  sendNotificationToUsers: async (userIds, notification) => {
    const response = await api.post('/admin/notifications/targeted', { userIds, ...notification });
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/admin/notifications');
    return response.data;
  },

  // Settings et configuration
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  },

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

// export default adminApi;
