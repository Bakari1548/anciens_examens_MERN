import api from '@/api/api';

export const settingsApi = {
  // Settings et configuration
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.put('/settings', settings);
    return response.data;
  },

  // Notifications et communications
  sendGlobalNotification: async (notification) => {
    const response = await api.post('/notifications/global', notification);
    return response.data;
  },

  sendNotificationToUsers: async (userIds, notification) => {
    const response = await api.post('/notifications/targeted', { userIds, ...notification });
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  }
};
