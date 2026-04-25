import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import signupImage from '@/assets/student3.webp';
import { register } from '../services/auth.api';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    ufr: '',
    filiere: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Vérifier que les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(true);
      const response = await register(formData.firstName, formData.lastName, formData.email, formData.password, formData.ufr, formData.filiere);
      
      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate('/connexion');
      }, 500);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription';
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
          <div className="p-8 md:p-12 order-2 md:order-1">
            <h2 className="text-2xl font-bold pb-6 pt-2 text-gray-800">Créer un compte</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-md font-medium text-gray-800 mb-2">
                    Prénom :
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-md font-medium text-gray-800 mb-2">
                    Nom :
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-md font-medium text-gray-800 mb-2">
                  Email universitaire :
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="ufr" className="block text-md font-medium text-gray-800 mb-2">
                  UFR :
                </label>
                <select
                  id="ufr"
                  name="ufr"
                  value={formData.ufr}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez votre UFR</option>
                  <option value="UFR Sciences et Technologies">UFR Sciences et Technologies</option>
                  <option value="UFR Sciences Économiques et de Gestion">UFR Sciences Économiques et de Gestion</option>
                  <option value="UFR Lettres, Arts et Communication">UFR Lettres, Arts et Communication</option>
                  <option value="UFR Sciences Juridiques et Politiques">UFR Sciences Juridiques et Politiques</option>
                </select>
              </div>

              <div>
                <label htmlFor="filiere" className="block text-md font-medium text-gray-800 mb-2">
                  Filière :
                </label>
                <select
                  id="filiere"
                  name="filiere"
                  value={formData.filiere}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez votre filière</option>
                  <option value="L1">Licence 1</option>
                  <option value="L2">Licence 2</option>
                  <option value="L3">Licence 3</option>
                  <option value="M1">Master 1</option>
                  <option value="M2">Master 2</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-md font-medium text-gray-800 mb-2">
                  Mot de passe :
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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

              <div>
                <label htmlFor="confirmPassword" className="block text-md font-medium text-gray-800 mb-2">
                  Confirmer mot de passe :
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                {loading ? 'Inscription en cours...' : 'S\'inscrire'}
              </button>

              <p className="text-center">
                Vous avez déjà un compte ?{' '}
                <Link to="/connexion" className="text-blue-600 hover:underline font-semibold">
                  Se connecter
                </Link>
              </p>
            </form>
          </div>

          {/* Image illustration */}
          <div className="hidden md:block bg-gradient-to-br from-violet-50 to-emerald-50 p-8 order-1 md:order-2">
            <img
              src={signupImage}
              alt="Étudiante travaillant"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
