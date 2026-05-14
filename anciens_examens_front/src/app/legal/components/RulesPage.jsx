import { useState, useEffect } from 'react';
import FAQ from './FAQ';

export default function RulesPage() {
  const [activeArticle, setActiveArticle] = useState('article1');

  const handleSmoothScroll = (e, articleId) => {
    e.preventDefault();
    const element = document.getElementById(articleId);
    if (element) {
      const headerOffset = 100; // Ajuster selon la hauteur du header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const articles = [
        'article1', 'article2', 'article3', 'article4', 'article5',
        'article6', 'article7'
      ];
      
      for (let i = articles.length - 1; i >= 0; i--) {
        const element = document.getElementById(articles[i]);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveArticle(articles[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-gray-600">
            Plateforme des Anciens Examens - Université de Thiès
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Dernière mise à jour : Mai 2026
          </p>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Sommaire</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#article1" onClick={(e) => handleSmoothScroll(e, 'article1')} className={`transition-colors ${activeArticle === 'article1' ? 'text-violet-600 font-semibold' : 'text-gray-600 hover:text-violet-600'}`}>Article 1 : Objet</a>
                </li>
                <li>
                  <a href="#article2" onClick={(e) => handleSmoothScroll(e, 'article2')} className={`transition-colors ${activeArticle === 'article2' ? 'text-violet-600 font-semibold' : 'text-gray-600 hover:text-violet-600'}`}>Article 2 : Documents</a>
                </li>
                <li>
                  <a href="#article3" onClick={(e) => handleSmoothScroll(e, 'article3')} className={`transition-colors ${activeArticle === 'article3' ? 'text-violet-600 font-semibold' : 'text-gray-600 hover:text-violet-600'}`}>Article 3 : Comportement</a>
                </li>
                <li>
                  <a href="#article4" onClick={(e) => handleSmoothScroll(e, 'article4')} className={`transition-colors ${activeArticle === 'article4' ? 'text-violet-600 font-semibold' : 'text-gray-600 hover:text-violet-600'}`}>Article 4 : Confidentialité</a></li>
                <li>
                  <a href="#article5" onClick={(e) => handleSmoothScroll(e, 'article5')} className={`transition-colors ${activeArticle === 'article5' ? 'text-violet-600 font-semibold' : 'text-gray-600 hover:text-violet-600'}`}>Article 5 : Contributions</a></li>
                <li>
                  <a href="#article6" onClick={(e) => handleSmoothScroll(e, 'article6')} className={`transition-colors ${activeArticle === 'article6' ? 'text-violet-600 font-semibold' : 'text-gray-600 hover:text-violet-600'}`}>Article 6 : Sanctions</a></li>
                <li>
                  <a href="#article7" onClick={(e) => handleSmoothScroll(e, 'article7')} className={`transition-colors ${activeArticle === 'article7' ? 'text-violet-600 font-semibold' : 'text-gray-600 hover:text-violet-600'}`}>Article 7 : Contact</a></li>
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white rounded-lg shadow-sm p-8">
            
            {/* Article 1 */}
            <article id="article1" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 1 : Objet</h2>
              <p className="text-gray-600 mb-4">
                Les présentes conditions générales d'utilisation (ci-après « CGU ») ont pour objet de définir les règles d'accès et d'utilisation de la plateforme des Anciens Examens de l'Université de Thiès.
              </p>
              <p className="text-gray-600">
                Toute utilisation de la plateforme implique l'acceptation sans réserve des présentes CGU.
              </p>
            </article>

            {/* Article 2 */}
            <article id="article2" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 2 : Documents et propriété intellectuelle</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2.1 Utilisation des documents</h3>
              <p className="text-gray-600 mb-4">
                Les examens mis à disposition sur la plateforme sont destinés à un usage strictement personnel et éducatif. L'utilisateur s'engage à :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6 mb-6">
                <li>Utiliser les documents à titre informatif et pédagogique uniquement</li>
                <li>Ne pas reproduire les documents à des fins commerciales</li>
                <li>Respecter la propriété intellectuelle de l'université</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">2.2 Propriété intellectuelle</h3>
              <p className="text-gray-600 mb-4">
                Tous les documents restent la propriété intellectuelle de l'Université de Thiès. Toute utilisation dans des travaux académiques doit inclure une citation appropriée.
              </p>
              <p className="text-gray-600">
                Il est formellement interdit de modifier les documents originaux sans autorisation expresse.
              </p>
            </article>

            {/* Article 3 */}
            <article id="article3" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 3 : Comportement des utilisateurs</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3.1 Respect de la communauté</h3>
              <p className="text-gray-600 mb-4">
                L'utilisateur s'engage à maintenir un environnement respectueux et constructif. Il est notamment tenu de :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6 mb-6">
                <li>Utiliser un langage approprié dans les commentaires et avis</li>
                <li>S'abstenir de tout harcèlement ou discrimination</li>
                <li>Ne pas publier de contenu offensant ou inapproprié</li>
                <li>Respecter les autres membres de la communauté</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">3.2 Collaboration et entraide</h3>
              <p className="text-gray-600">
                L'entraide et la collaboration sont encouragées. Les utilisateurs sont invités à partager leurs connaissances de manière constructive et à signaler les erreurs respectueusement.
              </p>
            </article>

            {/* Article 4 */}
            <article id="article4" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 4 : Confidentialité et sécurité</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4.1 Protection des données</h3>
              <p className="text-gray-600 mb-4">
                La plateforme collecte et traite les données personnelles conformément à la réglementation en vigueur. L'utilisateur dispose d'un droit d'accès, de modification et de suppression de ses données.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6 mb-6">
                <li>Email universitaire requis pour vérification</li>
                <li>Aucun partage des informations personnelles sans consentement</li>
                <li>Mot de passe sécurisé obligatoire</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">4.2 Responsabilité du compte</h3>
              <p className="text-gray-600">
                Chaque utilisateur est responsable de son compte et de ses actions. En cas de compromission du compte, l'utilisateur doit en informer immédiatement l'administration.
              </p>
            </article>

            {/* Article 5 */}
            <article id="article5" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 5 : Contributions des utilisateurs</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5.1 Partage d'examens</h3>
              <p className="text-gray-600 mb-4">
                Les utilisateurs peuvent contribuer en partageant des examens. Pour garantir l'organisation et la consultation efficace des documents, chaque partage doit inclure les informations suivantes :
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Champs obligatoires pour le partage :</h4>
                <ul className="list-disc list-inside space-y-3 text-gray-600 ml-6">
                  <li>
                    <span className="font-medium text-gray-800">UFR (Unité de Formation et de Recherche) :</span>
                    Précisez l'UFR concernée (ex: UFR Sciences Appliquées et Technologie, UFR Lettres et Sciences Humaines, etc.)
                  </li>
                  <li>
                    <span className="font-medium text-gray-800">Filière :</span>
                    Indiquez la filière d'études (ex: Informatique, Génie Civil, Mathématiques, Droit, etc.)
                  </li>
                  <li>
                    <span className="font-medium text-gray-800">Niveau :</span>
                    Spécifiez le niveau académique (ex: Licence 1, Licence 2, Licence 3, Master 1, Master 2)
                  </li>
                  <li>
                    <span className="font-medium text-gray-800">Année de l'examen :</span>
                    Mentionnez l'année où l'examen a été passé (ex: 2023, 2024, 2025)
                  </li>
                  <li>
                    <span className="font-medium text-gray-800">Type d'examen :</span>
                    Indiquez le type d'examen (ex: Examen Final, Devoir, Session de Rattrapage)
                  </li>
                  <li>
                    <span className="font-medium text-gray-800">Semestre :</span>
                    Précisez le semestre concerné (ex: S1, S2, S3, etc.)
                  </li>
                  <li>
                    <span className="font-medium text-gray-800">Matière :</span>
                    Précisez le nom exact de la matière concernée par l'examen
                  </li>
                </ul>
              </div>
              <p className="text-gray-600 mb-4">
                Ces informations permettent aux autres étudiants de trouver rapidement les examens pertinents pour leur parcours.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6 mb-6">
                <li>Documents authentiques et non modifiés</li>
                <li>Format PDF ou image de bonne qualité</li>
                <li>Absence d'informations personnelles</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">5.2 Qualité et modération</h3>
              <p className="text-gray-600">
                L'administration se réserve le droit de modérer ou de refuser toute contribution ne respectant pas les standards de qualité ou les présentes conditions.
              </p>
            </article>

            {/* Article 6 */}
            <article id="article6" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 6 : Sanctions et litiges</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6.1 Sanctions</h3>
              <p className="text-gray-600 mb-4">
                Le non-respect des présentes conditions entraîne des sanctions progressives :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6 mb-6">
                <li>Avertissement pour première infraction</li>
                <li>Suspension temporaire pour récidive</li>
                <li>Bannissement permanent pour violations graves</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">6.2 Signalements</h3>
              <p className="text-gray-600">
                Un système de signalement est disponible pour toute violation. Les signalements sont traités de manière confidentielle par les administrateurs.
              </p>
            </article>

            {/* Article 7 */}
            <article id="article7" className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article 7 : Contact et support</h2>
              <p className="text-gray-600 mb-4">
                Pour toute question concernant les présentes conditions ou pour signaler un problème, l'utilisateur peut contacter le support :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-6">
                <li>Email : <a href="mailto:support@anciensexamensuidt.app" className="text-violet-600 hover:underline">support@anciensexamensuidt.app</a></li>
                <li>Réponse sous 48h</li>
                <li>Assistance technique disponible</li>
              </ul>
            </article>

            {/* FAQ Section */}
            <FAQ />
            
          </main>
        </div>
      </div>
    </div>
  );
}
