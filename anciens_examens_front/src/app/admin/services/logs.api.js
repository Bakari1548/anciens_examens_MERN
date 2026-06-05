import api from '@/api/api';

export const logsApi = {
  // Récupérer tous les logs avec filtres et pagination
  getLogs: async (params = {}) => {
    try {
      const { page = 1, limit = 20, level, action, search } = params;
      const queryParams = new URLSearchParams();
      
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);
      if (level) queryParams.append('level', level);
      if (action) queryParams.append('action', action);
      if (search) queryParams.append('search', search);
      
      const response = await api.get(`/logs?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  },

  // Récupérer les statistiques des logs
  getLogStats: async () => {
    try {
      const response = await api.get('/logs/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching log stats:', error);
      throw error;
    }
  },

  // Créer un log
  createLog: async (logData) => {
    try {
      const response = await api.post('/logs', logData);
      return response.data;
    } catch (error) {
      console.error('Error creating log:', error);
      throw error;
    }
  },

  // Exporter les logs en CSV
  exportLogs: async (params = {}) => {
    try {
      const { level, action, startDate, endDate } = params;
      const queryParams = new URLSearchParams();
      
      if (level) queryParams.append('level', level);
      if (action) queryParams.append('action', action);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const response = await api.get(`/logs/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'logs.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error('Error exporting logs:', error);
      throw error;
    }
  },

  // Supprimer les logs anciens
  deleteOldLogs: async (days = 30) => {
    try {
      const response = await api.delete(`/logs/cleanup?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting old logs:', error);
      throw error;
    }
  }
};
