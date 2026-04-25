import api from '@/api/api';

export const userApi = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  },

  getUserExams: async (params = {}) => {
    const { page = 1, limit = 10 } = params;
    const response = await api.get(`/exams/user?page=${page}&limit=${limit}`);
    console.log(response);
    return response.data;
  }
};
