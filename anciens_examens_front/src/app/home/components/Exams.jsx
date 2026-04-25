import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Search, Filter } from 'lucide-react';

export default function Exams() {
    const navigate = useNavigate();

    return (
        <div className="p-4 sm:px-12 px-6 flex flex-col gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-3xl font-bold mb-2">Tous les examens</h3>
                        <p className="text-blue-100 text-lg max-w-xl">
                            Accédez à tous les anciens examens partagés par la communauté avec des filtres avancés et une recherche intuitive
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/examens')}
                        className="flex items-center gap-3 bg-white text-blue-600 px-6 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl group"
                    >
                        <span>Explorer tous les examens</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition-colors">
                    <Search className="text-blue-600 mb-3" size={28} />
                    <h4 className="font-semibold text-gray-900 mb-2">Recherche avancée</h4>
                    <p className="text-gray-600 text-sm">
                        Trouvez rapidement les examens par titre, matière ou année
                    </p>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition-colors">
                    <Filter className="text-blue-600 mb-3" size={28} />
                    <h4 className="font-semibold text-gray-900 mb-2">Filtres multiples</h4>
                    <p className="text-gray-600 text-sm">
                        Filtrez par UFR, filière, matière et année pour affiner vos résultats
                    </p>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition-colors">
                    <BookOpen className="text-blue-600 mb-3" size={28} />
                    <h4 className="font-semibold text-gray-900 mb-2">Pagination intelligente</h4>
                    <p className="text-gray-600 text-sm">
                        Navigation fluide avec des résultats optimisés par page
                    </p>
                </div>
            </div>
        </div>
    );
}