import api from '@/api/api';

export const userApi = {
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserExams: async (params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const response = await api.get(`/exams/user?page=${page}&limit=${limit}`);
      // console.log(response);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
