import { useAdmin } from '../context/AdminContext';

export function useAdminUsers() {
  const { 
    users, 
    fetchUsers, 
    updateUser, 
    deleteUser, 
    activateUser, 
    desactivateUser,
    banUser,
    unbanUser, 
    toggleUserStatus, 
    loading, 
    addNotification 
  } = useAdmin();
  
  
  return {
    users,
    fetchUsers,
    updateUser,
    deleteUser,
    activateUser,
    desactivateUser,
    toggleUserStatus,
    banUser,
    unbanUser,
    loading,
    addNotification
  };
}
