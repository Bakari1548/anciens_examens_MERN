import { useState } from 'react';
import { AlertCircle, Send, CheckCircle, XCircle } from 'lucide-react';
import { appealApi } from '../app/user/services/appeal.api';
import { toast } from 'sonner';

export default function AccountAppeal() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Veuillez entrer votre message');
      return;
    }

    try {
      setLoading(true);
      await appealApi.submitAppeal(message);
      toast.success('Demande soumis avec succès');
      setSubmitted(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la soumission du Demande';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-amber-600" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compte désactivé</h1>
          <p className="text-gray-600">
            Votre compte a été désactivé par un administrateur. Vous pouvez soumettre une demande pour la réactivation de votre compte.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande soumise</h2>
            <p className="text-gray-600 mb-6">
              Votre demande a été soumise avec succès. Les administrateurs examineront votre demande et vous informeront de leur décision.
            </p>
            <p className="text-sm text-gray-500">
              Vous serez notifié par email dès qu'une décision sera prise.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="message" className="block text-md font-medium text-gray-800 mb-2">
                Votre message de demande d'activation :
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                placeholder="Expliquez pourquoi votre compte devrait être réactivé..."
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Soyez clair et concis dans votre explication.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Soumettre la demande
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Si vous avez des questions, contactez l'administration à l'adresse : admin@univ-thies.sn
          </p>
        </div>
      </div>
    </div>
  );
}
