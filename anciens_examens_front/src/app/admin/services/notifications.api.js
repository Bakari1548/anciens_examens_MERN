import api from '@/api/api';

export const notificationsApi = {
  // Obtenir les notifications de l'utilisateur
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Marquer une notification comme lue
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  // Supprimer une notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Supprimer toutes les notifications
  clearAllNotifications: async () => {
    const response = await api.delete('/notifications');
    return response.data;
  },

  // Envoyer une notification (admin)
  sendNotification: async (notification) => {
    const response = await api.post('/notifications/send', notification);
    return response.data;
  },

  // Envoyer une notification globale (admin)
  sendGlobalNotification: async (notification) => {
    const response = await api.post('/notifications/global', notification);
    return response.data;
  },

  // Envoyer une notification ciblée (admin)
  sendTargetedNotification: async (userIds, notification) => {
    const response = await api.post('/notifications/targeted', { userIds, ...notification });
    return response.data;
  }
};
