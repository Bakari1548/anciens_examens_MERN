import { useState, useEffect } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const testimonials = [
    {
      id: 1,
      name: "Aminata Diallo",
      role: "Étudiante en L2 Informatique",
      university: "Université Cheikh Anta Diop",
      avatar: "AD",
      rating: 5,
      content: "Cette plateforme a transformé ma façon de réviser. J'ai trouvé des examens des années précédentes qui m'ont permis de comprendre les attentes des professeurs. Mes notes ont considérablement amélioré !",
      highlight: "Notes améliorées de 35%"
    },
    {
      id: 2,
      name: "Ibrahima Ba",
      role: "Étudiant en M1 Sciences Économiques",
      university: "Université Gaston Berger",
      avatar: "IB",
      rating: 5,
      content: "Je recommande vivement ce site à tous mes camarades. Les examens sont bien organisés par matière et année. Le téléchargement est rapide et les documents sont de bonne qualité.",
      highlight: "Économie de temps de révision"
    },
    {
      id: 3,
      name: "Fatoumata Camara",
      role: "Étudiante en L3 Droit",
      university: "Université Assane Seck",
      avatar: "FC",
      rating: 5,
      content: "Grâce aux examens que j'ai trouvés ici, j'ai pu me préparer efficacement pour mes partiels. La variété des matières disponibles est impressionnante. Vraiment utile !",
      highlight: "Réussite aux partiels"
    },
    {
      id: 4,
      name: "Moussa Ndiaye",
      role: "Étudiant en L1 Sciences",
      university: "Université Alioune Diop",
      avatar: "MN",
      rating: 5,
      content: "La communauté est très active et les examens partagés sont pertinents. J'ai pu accéder à des documents que je ne trouvais nulle part ailleurs. Merci pour cette ressource précieuse !",
      highlight: "Documents exclusifs"
    },
    {
      id: 5,
      name: "Mariama Sow",
      role: "Étudiante en M2 Communication",
      university: "Université Virtuelle du Sénégal",
      avatar: "MS",
      rating: 5,
      content: "Interface intuitive, recherche facile et téléchargement rapide. Ce site facilite vraiment la préparation aux examens. Je le consulte régulièrement avant chaque évaluation.",
      highlight: "Utilisation quotidienne"
    }
  ];

  const nextTestimonial = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      setIsAnimating(false);
    }, 300);
  };

  const prevTestimonial = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentTestimonial((prev) => 
        prev === 0 ? testimonials.length - 1 : prev - 1
      );
      setIsAnimating(false);
    }, 300);
  };

  const goToTestimonial = (index) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentTestimonial(index);
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000); // Changement automatique toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={20}
        className={index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ce que nos étudiants en disent
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les témoignages de milliers d'étudiants qui ont amélioré leurs résultats grâce à notre plateforme
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Témoignage principal */}
          <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 shadow-xl transition-all duration-300 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar et infos */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {testimonials[currentTestimonial].name}
                  </h3>
                  <p className="text-gray-600">
                    {testimonials[currentTestimonial].role}
                  </p>
                  <p className="text-sm text-gray-500">
                    {testimonials[currentTestimonial].university}
                  </p>
                </div>
              </div>

              {/* Contenu du témoignage */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  {renderStars(testimonials[currentTestimonial].rating)}
                </div>
                <div className="relative">
                  <Quote className="text-blue-200 absolute -top-2 -left-2" size={40} />
                  <p className="text-gray-700 text-lg leading-relaxed pl-8 mb-6">
                    {testimonials[currentTestimonial].content}
                  </p>
                </div>
                <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {testimonials[currentTestimonial].highlight}
                </div>
              </div>
            </div>
          </div>

          {/* Contrôles de navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>

            {/* Indicateurs */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'w-8 bg-blue-600' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Statistiques des témoignages */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">4.9/5</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {renderStars(5)}
            </div>
            <p className="text-gray-600">Note moyenne</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">2,847</div>
            <p className="text-gray-600">Avis vérifiés</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">96%</div>
            <p className="text-gray-600">Recommandent</p>
          </div>
        </div>
      </div>
    </section>
  );
}
