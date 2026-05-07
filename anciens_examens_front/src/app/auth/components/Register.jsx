import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import signupImage from '@/assets/student3.webp';
import { register } from '../services/auth.api';
import { getAllUfrs, getFilieresByUfr } from '../../exam/services/exam.api';

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
  
  // Données académiques dynamiques
  const [ufrs, setUfrs] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [loadingUfrs, setLoadingUfrs] = useState(false);
  const [loadingFilieres, setLoadingFilieres] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Réinitialiser la filière si l'UFR change
    if (name === 'ufr') {
      setFormData(prev => ({
        ...prev,
        ufr: value,
        filiere: ''
      }));
    }
  };

  // Charger les UFRs au montage
  useEffect(() => {
    const loadUfrs = async () => {
      try {
        setLoadingUfrs(true);
        const response = await getAllUfrs();
        setUfrs([{ value: '', label: 'Sélectionnez votre UFR' }, ...response.data.map(ufr => ({ value: ufr.name, label: ufr.name }))]);
      } catch (error) {
        console.error('Erreur lors du chargement des UFRs:', error);
        toast.error('Erreur lors du chargement des UFRs');
      } finally {
        setLoadingUfrs(false);
      }
    };
    loadUfrs();
  }, []);

  // Charger les filières quand l'UFR change
  useEffect(() => {
    const loadFilieres = async () => {
      if (!formData.ufr) {
        setFilieres([{ value: '', label: 'Sélectionnez votre filière' }]);
        return;
      }
      try {
        setLoadingFilieres(true);
        const response = await getFilieresByUfr(formData.ufr);
        setFilieres([{ value: '', label: 'Sélectionnez votre filière' }, ...response.data.map(f => ({ value: f.name, label: f.name }))]);
      } catch (error) {
        console.error('Erreur lors du chargement des filières:', error);
        setFilieres([{ value: '', label: 'Sélectionnez votre filière' }]);
        toast.error('Erreur lors du chargement des filières');
      } finally {
        setLoadingFilieres(false);
      }
    };
    loadFilieres();
  }, [formData.ufr]);

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
    
    if (formData.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      setLoading(true);
      const response = await register(formData.firstName, formData.lastName, formData.email, formData.password, formData.ufr, formData.filiere);
      
      toast.success('Inscription réussie !');
      
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate('/');
      }, 500);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-2 sm:px-6 py-12">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Formulaire */}
          <div className="sm:p-8 p-5 py-6 md:p-12 order-2 md:order-1">
            <h2 className="text-2xl font-bold pb-6 pt-2 text-gray-800">Créer un compte</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
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
                  placeholder='monemail@univ-thies.sn'
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
                  disabled={loadingUfrs}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:opacity-50"
                >
                  {ufrs.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
                  disabled={loadingFilieres || !formData.ufr}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:opacity-50"
                >
                  {filieres.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
