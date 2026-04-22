import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { tokenStorage } from '@/utils/tokenStorage';
import { adminApi } from '@/app/admin/services/admin.api';

export default function AdminProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Vérifier si l'utilisateur est connecté
        const userData = tokenStorage.getUser();
        const token = tokenStorage.getToken();
        
        if (!userData || !token) {
          navigate('/connexion');
          return;
        }
        
        setUser(userData);
        
        // Vérifier si l'utilisateur a les droits admin
        const response = await adminApi.checkAdminStatus();
        console.log(response);
        
        
        if (response.data.user.role === 'admin' || response.data.user.role === 'moderator') {
          setIsAdmin(true);
          setUser(response.data.user);
        } else {
          // Rediriger vers la page d'accueil si pas admin
          navigate('/');
          return;
        }
        
      } catch (error) {
        console.error('Erreur de vérification admin:', error);
        // En cas d'erreur, rediriger vers la page d'accueil
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Vérification des autorisations administratives...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return children;
}
