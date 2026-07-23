import { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../services/user.api';
import { tokenStorage } from '@/utils/tokenStorage';
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
      // console.log(response.user);
    } catch (error) {
      // Si erreur 401 mais qu'on a déjà des données locales, ne pas afficher d'erreur
      // L'utilisateur est connecté via cookie mais l'API a échoué
      if (error.response?.status === 401 && user) {
        console.log('Session expirée, utilisation des données locales');
        return;
      }
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

  const deleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      await userApi.deleteAccount();
      toast.success('Compte supprimé avec succès');
    } catch (error) {
      setError(error.message);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression du compte');
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
      if (response.exams.length === 0) {
        setUserExams([]);
      } else {
        setUserExams(response.exams || []);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // D'abord, essayer de récupérer les données utilisateur depuis le stockage local
    const localUser = tokenStorage.getUser();
    if (localUser) {
      setUser(localUser);
    }
    
    // Ensuite, faire un appel API pour rafraîchir les données si nécessaire
    // mais seulement si l'utilisateur est connecté
    if (localUser) {
      fetchProfile();
    }
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
        deleteAccount,
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
