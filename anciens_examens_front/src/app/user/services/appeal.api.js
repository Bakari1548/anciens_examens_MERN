import api from '@/api/api';

export const appealApi = {
  submitAppeal: async (message) => {
    const response = await api.post('/users/appeal', { message });
    return response.data;
  },

  getAllAppeals: async () => {
    const response = await api.get('/users/appeals');
    return response.data;
  },

  approveAppeal: async (userId, reviewMessage) => {
    const response = await api.put(`/users/appeals/${userId}/approve`, { reviewMessage });
    return response.data;
  },

  rejectAppeal: async (userId, reviewMessage) => {
    const response = await api.put(`/users/appeals/${userId}/reject`, { reviewMessage });
    return response.data;
  }
};
