import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../services/resetPassword.api';
import { toast } from 'sonner';
import changePasswordImage from '@/assets/change_password.png';

export default function ResetPasswordWithToken() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si le token est présent
    if (!token) {
      setIsValid(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, password);
      toast.success('Mot de passe réinitialisé avec succès');
      setTimeout(() => {
        navigate('/connexion');
      }, 2000);
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la réinitialisation du mot de passe');
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Lien invalide ou expiré</h2>
          <p className="text-gray-600 mb-6">
            Le lien de réinitialisation n'est pas valide ou a expiré. Veuillez demander une nouvelle réinitialisation.
          </p>
          <Link
            to="/mot-de-passe-oublie"
            className="inline-block bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
          >
            Demander une nouvelle réinitialisation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Formulaire */}
          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-bold pb-6 pt-2 text-gray-800">Nouveau mot de passe</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block mb-2 text-gray-700">
                  Nouveau mot de passe :
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block mb-2 text-gray-700">
                  Confirmer le mot de passe :
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
              </button>

              <p className="text-center">
                <Link to="/connexion" className="text-blue-600 hover:underline">
                  Retour à la connexion
                </Link>
              </p>
            </form>
        </div>

        {/* Image illustration */}
        <div className="hidden md:block bg-gradient-to-br from-violet-50 to-emerald-50 p-8">
          <img
            src={changePasswordImage}
            alt="Changement de mot de passe"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
    </div>
  );
}
