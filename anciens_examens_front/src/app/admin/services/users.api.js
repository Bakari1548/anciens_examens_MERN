import api from '@/api/api';

export const usersApi = {
  // Gestion des utilisateurs
  getUsers: async (params = {}) => {
    const { page = 1, limit = 20, search, role, status } = params;
    const queryParams = new URLSearchParams({
      ...(search && { search }),
      ...(role && { role }),
      ...(status && { status })
    });
    const response = await api.get(`/users/all/${page}/${limit}`);
    console.log(response.data);
    
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/users/get/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/update/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/users/delete/${userId}`);
    return response.data;
  },

  activateUser: async (userId) => {
    const response = await api.put(`/users/activate/${userId}`);
    return response.data;
  },

  desactivateUser: async (userId) => {
    const response = await api.put(`/users/desactivate/${userId}`);
    return response.data;
  },

  banUser: async (userId, duration, reason) => {
    const response = await api.put(`/users/ban/${userId}`, { duration, reason });
    return response.data;
  },

  unbanUser: async (userId) => {
    const response = await api.put(`/users/unban/${userId}`);
    return response.data;
  }
};
