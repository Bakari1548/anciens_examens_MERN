import { useState } from 'react';
import { Mail, Send, CheckCircle, Bell, BookOpen, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);
    
    try {
      // Simulation d'envoi à une API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubscribed(true);
      toast.success('Inscription réussie ! Vous recevrez nos dernières actualités.');
      setEmail('');
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-white" size={32} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Merci pour votre inscription !
            </h3>
            <p className="text-xl text-white/90 mb-8">
              Vous recevrez nos dernières actualités et offres exclusives directement dans votre boîte mail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center gap-2 text-white/80">
                <BookOpen size={20} />
                <span>Nouveaux examens chaque semaine</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Users size={20} />
                <span>Conseils d'étudiants</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Bell size={20} />
                <span>Alertes examens à venir</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="text-white" size={32} />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Ne manquez aucune actualité
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Recevez les derniers examens, conseils d'étudiants et offres exclusives directement dans votre boîte mail
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Nouveaux examens
            </h3>
            <p className="text-white/80 text-sm">
              Soyez le premier à découvrir les nouveaux examens ajoutés chaque semaine
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Conseils d'étudiants
            </h3>
            <p className="text-white/80 text-sm">
              Recevez des astuces et méthodes de révision de la communauté
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Alertes examens
            </h3>
            <p className="text-white/80 text-sm">
              Soyez notifié des examens importants à ne pas manquer
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez votre adresse email"
                className="w-full px-6 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Inscription...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>S'inscrire</span>
                </>
              )}
            </button>
          </div>
          <p className="text-center text-white/70 text-sm mt-4">
            Nous respectons votre vie privée. Désabonnez-vous à tout moment.
          </p>
        </form>

        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>15 234 abonnés</span>
            </div>
            <div className="text-white/50">|</div>
            <div className="flex items-center gap-2">
              <span>98% de taux d'ouverture</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
