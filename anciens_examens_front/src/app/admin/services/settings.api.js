import api from '@/api/api';
import { notificationsApi } from './notifications.api';

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

  // Notifications et communications (délégué à notificationsApi)
  sendGlobalNotification: notificationsApi.sendGlobalNotification,
  sendNotificationToUsers: notificationsApi.sendTargetedNotification,

  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  }
};
