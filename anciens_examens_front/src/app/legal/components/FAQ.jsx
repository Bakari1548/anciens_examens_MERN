import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Users, FileText, Lock, Upload, AlertCircle } from 'lucide-react';

export default function FAQ() {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleItem = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const faqItems = [
    {
      id: 'account',
      icon: <Users className="w-5 h-5" />,
      question: 'Comment créer un compte sur la plateforme ?',
      answer: 'Pour créer un compte, cliquez sur "Créer un compte" dans le menu, remplissez le formulaire avec votre email universitaire, vos informations personnelles et choisissez un mot de passe sécurisé. Vous recevrez un email de confirmation pour activer votre compte.'
    },
    {
      id: 'upload',
      icon: <Upload className="w-5 h-5" />,
      question: 'Quels sont les formats de fichiers acceptés pour partager un examen ?',
      answer: 'Nous acceptons les formats PDF, JPG, JPEG et PNG. Assurez-vous que les documents sont lisibles, de bonne qualité et ne contiennent pas d\'informations personnelles. Les fichiers ne doivent pas dépasser 10MB.'
    },
    {
      id: 'search',
      icon: <FileText className="w-5 h-5" />,
      question: 'Comment trouver efficacement les examens dont j\'ai besoin ?',
      answer: 'Utilisez la barre de recherche en spécifiant la matière, le niveau, l\'UFR ou la filière. Vous pouvez également filtrer par année académique et par type d\'examen. Les informations complètes (UFR, filière, niveau, année, matière, type, semestre) sont requises pour chaque partage.'
    },
    {
      id: 'privacy',
      icon: <Lock className="w-5 h-5" />,
      question: 'Mes informations personnelles sont-elles sécurisées ?',
      answer: 'Oui, nous protégeons vos données conformément à la réglementation en vigueur. Votre email universitaire est utilisé uniquement pour la vérification, et nous ne partageons aucune information personnelle sans votre consentement. Vous pouvez modifier ou supprimer vos données à tout moment.'
    },
    {
      id: 'moderation',
      icon: <AlertCircle className="w-5 h-5" />,
      question: 'Que se passe-t-il si je viole les règles de la plateforme ?',
      answer: 'En cas de violation, nous appliquons des sanctions progressives : premier avertissement pour la première infraction, suspension temporaire pour récidive, et bannissement permanent pour violations graves. Tous les signalements sont traités de manière confidentielle.'
    },
    {
      id: 'contribution',
      icon: <HelpCircle className="w-5 h-5" />,
      question: 'Puis-je contribuer à améliorer la plateforme ?',
      answer: 'Absolument ! Vous pouvez nous aider en partageant des examens de qualité, en signalant les erreurs, en donnant votre avis sur les documents et en proposant des améliorations. Votre contribution est essentielle pour maintenir la plateforme utile pour tous les étudiants.'
    }
  ];

  return (
    <section className="bg-gray-50 rounded-lg md:p-8 p-4 mt-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions Fréquemment Posées</h2>
          <p className="text-gray-600">
            Retrouvez les réponses aux questions les plus courantes sur l'utilisation de la plateforme.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full sm:px-6 px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-violet-600">
                    {item.icon}
                  </div>
                  <h3 className="sm:text-lg text-sm font-medium text-gray-900 text-left">
                    {item.question}
                  </h3>
                </div>
                {expandedItems[item.id] ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {expandedItems[item.id] && (
                <div className="sm:px-6 px-4 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Vous ne trouvez pas réponse à votre question ?
          </p>
          <a 
            href="mailto:support@anciensexamensuidt.app" 
            className="inline-flex items-center gap-2 sm:px-6 px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            Contacter le support
          </a>
        </div>
      </div>
    </section>
  );
}