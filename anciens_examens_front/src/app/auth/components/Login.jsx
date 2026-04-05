import { useState } from 'react';
import { Link } from 'react-router';
import loginImage from '@/assets/students.webp';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de connexion à implémenter
    console.log('Connexion:', { username, password });
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
                <label htmlFor="username" className="block text-md font-medium mb-2">
                  Nom d'utilisateur :
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-md font-medium mb-2">
                  Mot de passe :
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-start">
                <Link to="/mot-de-passe-oublie" className="text-blue-600 hover:underline text-base">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
              >
                Se connecter
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
