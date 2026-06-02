import api from '@/api/api';

export const emailApi = {
  // Envoyer un email à des utilisateurs spécifiques
  sendEmailToUsers: async (data) => {
    try {
      const response = await api.post('/admin/emails/send', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Envoyer un email à tous les utilisateurs
  sendEmailToAll: async (data) => {
    try {
      const response = await api.post('/admin/emails/send-all', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Envoyer un email à des utilisateurs par rôle
  sendEmailByRole: async (data) => {
    try {
      const response = await api.post('/admin/emails/send-by-role', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer la liste des templates d'emails
  getEmailTemplates: async () => {
    try {
      const response = await api.get('/admin/emails/templates');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer l'historique des emails envoyés
  getEmailHistory: async (params = {}) => {
    try {
      const { page = 1, limit = 20 } = params;
      const response = await api.get(`/admin/emails/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les emails reçus
  getReceivedEmails: async () => {
    try {
      const response = await api.get('/admin/emails/received');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
