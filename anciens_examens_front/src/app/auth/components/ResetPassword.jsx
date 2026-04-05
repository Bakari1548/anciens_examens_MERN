import { useState } from 'react';
import { Link } from 'react-router';
import resetImage from '@/assets/student5.webp';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique d'envoi de l'email de réinitialisation
    console.log('Réinitialisation pour:', email);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Formulaire */}
          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-bold pb-6 pt-2 text-gray-800">Réinitialiser votre mot de passe</h2>
            
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block mb-2">
                    Courriel :
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                >
                  Envoyer
                </button>

                <p className="text-center">
                  <Link to="/connexion" className="text-blue-600 hover:underline">
                    Retour à la connexion
                  </Link>
                </p>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg">
                  Un email de réinitialisation a été envoyé à votre adresse.
                </div>
                <Link
                  to="/connexion"
                  className="block w-full text-center bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                >
                  Retour à la connexion
                </Link>
              </div>
            )}
          </div>

          {/* Image illustration */}
          <div className="hidden md:block bg-gradient-to-br from-violet-50 to-emerald-50 p-8">
            <img
              src={resetImage}
              alt="Étudiant préoccupé"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
