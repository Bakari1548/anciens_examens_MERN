import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { tokenStorage } from '@/utils/tokenStorage';

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const userData = tokenStorage.getUser();
      const token = tokenStorage.getToken();
      
      if (!userData || !token) {
        navigate('/connexion');
        return;
      }
      
      setUser(userData);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return children;
}
