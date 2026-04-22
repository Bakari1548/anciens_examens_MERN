import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, BookOpen, Users, Shield, Download, Search, Star } from 'lucide-react';

export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [openQuestions, setOpenQuestions] = useState({});

  const categories = [
    { id: 'general', name: 'Général', icon: HelpCircle, color: 'from-blue-500 to-blue-600' },
    { id: 'exams', name: 'Examens', icon: BookOpen, color: 'from-green-500 to-green-600' },
    { id: 'account', name: 'Compte', icon: Users, color: 'from-purple-500 to-purple-600' },
    { id: 'security', name: 'Sécurité', icon: Shield, color: 'from-red-500 to-red-600' },
    { id: 'technical', name: 'Technique', icon: Download, color: 'from-yellow-500 to-yellow-600' },
    { id: 'features', name: 'Fonctionnalités', icon: Star, color: 'from-indigo-500 to-indigo-600' }
  ];

  const faqData = {
    general: [
      {
        id: 'g1',
        question: "Qu'est-ce que Anciens Examens ?",
        answer: "Anciens Examens est une plateforme collaborative qui permet aux étudiants de partager et d'accéder à des examens des années précédentes. Notre mission est d'aider les étudiants à mieux se préparer pour leurs évaluations en leur donnant accès à des ressources pédagogiques pertinentes."
      },
      {
        id: 'g2',
        question: "Est-ce que le service est gratuit ?",
        answer: "Oui, l'accès à la plateforme et le téléchargement des examens sont entièrement gratuits. Nous croyons en l'éducation accessible pour tous. Certaines fonctionnalités premium pourraient être ajoutées à l'avenir, mais l'accès de base restera toujours gratuit."
      },
      {
        id: 'g3',
        question: "Comment puis-je contribuer à la plateforme ?",
        answer: "Vous pouvez contribuer de plusieurs manières : en partageant vos propres examens, en notant et commentant les documents existants, en signalant les erreurs, et en invitant vos camarades à rejoindre la communauté."
      }
    ],
    exams: [
      {
        id: 'e1',
        question: "Quels types d'examens sont disponibles ?",
        answer: "Notre plateforme contient des examens de toutes les matières et niveaux universitaires : partiels, examens finaux, rattrapages, examens de TP, et bien plus encore. Les documents couvrent toutes les universités sénégalaises."
      },
      {
        id: 'e2',
        question: "Les examens sont-ils à jour ?",
        answer: "Nous mettons régulièrement à jour notre base de données avec les derniers examens. La communauté ajoute constamment de nouveaux documents, et notre équipe vérifie leur pertinence avant publication."
      },
      {
        id: 'e3',
        question: "Puis-je trouver des examens de ma filière spécifique ?",
        answer: "Absolument ! Notre système de recherche avancée vous permet de filtrer par UFR, filière, matière, et année. Vous trouverez facilement les examens pertinents pour votre parcours."
      }
    ],
    account: [
      {
        id: 'a1',
        question: "Comment créer un compte ?",
        answer: "La création d'un compte est simple et rapide. Cliquez sur 'Créer un compte', remplissez vos informations (nom, email, mot de passe), et validez votre email. Le processus prend moins de 2 minutes."
      },
      {
        id: 'a2',
        question: "Puis-je modifier mes informations personnelles ?",
        answer: "Oui, vous pouvez modifier votre profil à tout moment depuis votre espace personnel. Vous pouvez changer votre nom, email, et mot de passe en quelques clics."
      },
      {
        id: 'a3',
        question: "Que faire si j'oublie mon mot de passe ?",
        answer: "Pas de panique ! Utilisez la fonction 'Mot de passe oublié' sur la page de connexion. Vous recevrez un email avec un lien pour réinitialiser votre mot de passe en toute sécurité."
      }
    ],
    security: [
      {
        id: 's1',
        question: "Mes données sont-elles sécurisées ?",
        answer: "Oui, nous prenons la sécurité très au sérieux. Vos données sont cryptées et stockées sur des serveurs sécurisés. Nous ne partageons jamais vos informations personnelles avec des tiers sans votre consentement."
      },
      {
        id: 's2',
        question: "Le partage d'examens est-il légal ?",
        answer: "Oui, le partage d'examens à des fins pédagogiques est légal. Nous encourageons le partage éthique des ressources dans le respect du droit d'auteur et des règles académiques."
      },
      {
        id: 's3',
        question: "Comment signale-t-on un contenu inapproprié ?",
        answer: "Chaque document dispose d'un bouton de signalement. Notre équipe modère rapidement tous les signalements et retire tout contenu ne respectant pas nos conditions d'utilisation."
      }
    ],
    technical: [
      {
        id: 't1',
        question: "Quels formats de fichiers sont acceptés ?",
        answer: "Nous acceptons principalement les fichiers PDF, ainsi que les images (JPG, PNG) pour les examens scannés. Le format PDF est recommandé pour une meilleure qualité et compatibilité."
      },
      {
        id: 't2',
        question: "Y a-t-il une limite de taille pour les fichiers ?",
        answer: "Oui, la taille maximale par fichier est de 25MB. Si votre document est plus volumineux, nous vous recommandons de le compresser ou de le diviser en plusieurs parties."
      },
      {
        id: 't3',
        question: "La plateforme fonctionne-t-elle sur mobile ?",
        answer: "Oui, notre site est entièrement responsive et fonctionne parfaitement sur smartphones et tablettes. Vous pouvez accéder aux examens et télécharger des documents où que vous soyez."
      }
    ],
    features: [
      {
        id: 'f1',
        question: "Puis-je sauvegarder des examens en favoris ?",
        answer: "Oui, les utilisateurs connectés peuvent ajouter des examens à leurs favoris pour y accéder rapidement plus tard. Vous pouvez créer des collections thématiques pour organiser vos ressources."
      },
      {
        id: 'f2',
        question: "Comment fonctionne le système de notation ?",
        answer: "Après avoir téléchargé un examen, vous pouvez le noter de 1 à 5 étoiles et laisser un commentaire. Cela aide la communauté à identifier les documents les plus pertinents."
      },
      {
        id: 'f3',
        question: "Y a-t-il une application mobile ?",
        answer: "Nous travaillons actuellement sur une application mobile qui sera disponible prochainement sur iOS et Android. Elle offrira des fonctionnalités supplémentaires comme les notifications et le mode hors-ligne."
      }
    ]
  };

  const toggleQuestion = (categoryId, questionId) => {
    setOpenQuestions(prev => ({
      ...prev,
      [`${categoryId}-${questionId}`]: !prev[`${categoryId}-${questionId}`]
    }));
  };

  const toggleAllQuestions = (categoryId, open) => {
    const newOpenQuestions = { ...openQuestions };
    faqData[categoryId].forEach(q => {
      newOpenQuestions[`${categoryId}-${q.id}`] = open;
    });
    setOpenQuestions(newOpenQuestions);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="text-white" size={32} />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Questions fréquemment posées
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trouvez des réponses à vos questions sur notre plateforme
          </p>
        </div>

        {/* Catégories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg transform scale-105`
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                <Icon size={20} />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Boutons d'action rapide */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => toggleAllQuestions(activeCategory, true)}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Tout déplier
          </button>
          <button
            onClick={() => toggleAllQuestions(activeCategory, false)}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Tout replier
          </button>
        </div>

        {/* Questions/Réponses */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqData[activeCategory].map((item) => {
            const isOpen = openQuestions[`${activeCategory}-${item.id}`];
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleQuestion(activeCategory, item.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {item.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <ChevronUp className="text-blue-600" size={20} />
                    ) : (
                      <ChevronDown className="text-gray-400" size={20} />
                    )}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-4">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-700 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Section contact */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Vous ne trouvez pas votre réponse ?
            </h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Notre équipe de support est là pour vous aider. N'hésitez pas à nous contacter pour toute question supplémentaire.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Contacter le support
              </button>
              <button className="px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors">
                Visiter le centre d'aide
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
