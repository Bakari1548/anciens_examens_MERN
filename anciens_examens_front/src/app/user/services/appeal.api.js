import api from '@/api/api';

export const appealApi = {
  submitAppeal: async (message, email) => {
    try {
      const response = await api.post('/users/appeal', { message, email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllAppeals: async () => {
    try {
      const response = await api.get('/users/appeals');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  approveAppeal: async (userId, reviewMessage) => {
    try {
      const response = await api.put(`/users/appeals/${userId}/approve`, { reviewMessage });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  rejectAppeal: async (userId, reviewMessage) => {
    try {
      const response = await api.put(`/users/appeals/${userId}/reject`, { reviewMessage });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
