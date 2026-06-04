import { Bot, Sparkles, FileText, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { useTheme } from '../../admin/context/ThemeContext';

export default function AISection() {
  const { isDark } = useTheme();

  return (
    <section className={`py-24 ${isDark ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <Bot className="w-6 h-6 text-white" />
            <span className="text-white font-semibold">Nouveauté</span>
          </div>
          <h2 className={`text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Intelligence Artificielle <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              Intégrée
            </span>
          </h2>
          <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Notre plateforme utilise l'IA pour vous faire gagner du temps et améliorer votre expérience d'apprentissage
          </p>
        </div>

        <div className="flex flex-row justify-center items-center">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Feature 1 - Large */}
            <div className={`group relative rounded-3xl p-8 overflow-hidden transition-all duration-300 hover:scale-105 ${isDark ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Chatbot Pédagogique
                </h3>
                <p className="text-blue-100">
                  Obtenez de l'aide pour comprendre les exercices grâce à notre tuteur IA interactif
                </p>
              </div>
            </div>
            {/* Feature 2 - Large */}
            <div className={`group relative rounded-3xl p-8 overflow-hidden transition-all duration-300 hover:scale-105 ${isDark ? 'bg-gradient-to-br from-purple-600 to-purple-700' : 'bg-gradient-to-br from-purple-500 to-purple-600'}`}>
              <div className="absolute top-0 -left-40 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Auto-complétion Intelligente
                </h3>
                <p className="text-purple-100">
                  Gagnez du temps grâce à l'auto-complétion intelligente des champs lors du partage d'examens
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className={`group rounded-2xl w-fit mx-auto p-6 border-2 transition-all duration-300 hover:border-blue-500 ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-900' : 'bg-gray-50 border-gray-200 hover:bg-white'}`}>
          <div className="flex items-center justify-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
              <ShieldCheck className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Détection de Doublons
              </h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Évitez les redondances grâce à la détection automatique des examens similaires déjà partagés
              </p>
            </div>
          </div>
        </div>
        <div className="mt-16 text-center">
          <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-full ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'}`}>
            <Zap className="w-6 h-6 text-yellow-500" />
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Propulsé par Google Gemini
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
