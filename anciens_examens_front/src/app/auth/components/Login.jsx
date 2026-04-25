import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import loginImage from '@/assets/students.webp';
import { login } from '../services/auth.api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      const response = await login(email, password);
      
      // Stocker les infos utilisateur
      const { tokenStorage } = await import('@/utils/tokenStorage');
      tokenStorage.setUser(response.user);
      
      toast.success('Connexion réussie !');
      
      // Rediriger vers le dashboard admin si l'utilisateur est admin, sinon vers l'accueil
      setTimeout(() => {
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 500);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Formulaire */}
          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-bold pb-6 pt-2 text-gray-800">Se connecter</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-md font-medium mb-2">
                  Adresse email :
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-md font-medium mb-2">
                  Mot de passe :
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-start">
                <Link to="/mot-de-passe-oublie" className="text-blue-600 hover:underline text-base">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>

              <p className="text-center text-base">
                Vous n'avez pas de compte ?{' '}
                <Link to="/inscription" className="text-blue-600 hover:underline font-semibold">
                  Inscrivez-vous !
                </Link>
              </p>
            </form>
          </div>

          {/* Image illustration */}
          <div className="hidden md:block bg-gradient-to-br from-violet-50 to-emerald-50 p-8">
            <img
              src={loginImage}
              alt="Étudiants"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
