import api from '@/api/api';

export const authApi = {
  // Vérifier le statut admin
  checkAdminStatus: async () => {
    const response = await api.get('/users/profile');
    return response;
  },

  isAdmin: async () => {
      try {
          const response = await api.get('/users/is-admin');
          console.log("isAdmin response:", response.data);
          return response.data.isAdmin;
      } catch (error) {
          console.log("isAdmin error:", error);
          throw error;
      }
  }
};
