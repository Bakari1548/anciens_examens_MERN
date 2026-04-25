import { useAdmin } from '../context/AdminContext';

export function useAdminAuth() {
  const { user, loading, error } = useAdmin();
  
  return {
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator',
    isLoading: loading,
    error,
    user
  };
}
