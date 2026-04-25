import { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../services/user.api';
import { toast } from 'sonner';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userExams, setUserExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getProfile();
      setUser(response.user);
    } catch (error) {
      setError(error.message);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.updateProfile(userData);
      setUser(response.user);
      toast.success('Profil mis à jour avec succès');
      return response.user;
    } catch (error) {
      setError(error.message);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      await userApi.changePassword(passwordData);
      toast.success('Mot de passe modifié avec succès');
    } catch (error) {
      setError(error.message);
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserExams = async (params = {page: 1, limit: 10}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getUserExams(params);
      setUserExams(response.exams || []);
    } catch (error) {
      setError(error.message);
      toast.error('Erreur lors du chargement des examens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        userExams,
        loading,
        error,
        fetchProfile,
        updateProfile,
        changePassword,
        fetchUserExams
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
