import api from '@/api/api';

export const authApi = {
  // Vérifier le statut admin
  checkAdminStatus: async () => {
    const response = await api.get('/users/profile');
    return response;
  }
};
