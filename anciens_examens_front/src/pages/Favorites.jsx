import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Heart, ChevronLeft, ChevronRight, Loader2, Search, Filter } from 'lucide-react';
import CardExam from '../app/exam/components/CardExam';
import { getFavorites as getFavoritesApi } from '../app/exam/services/exam.api';
import { tokenStorage } from '../utils/tokenStorage';
import ProtectedRoute from '../components/ProtectedRoute';
import { useTheme } from '../app/admin/context/ThemeContext';

function FavoritesContent() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const ITEMS_PER_PAGE = 12;

    useEffect(() => {
        loadFavorites();
    }, [currentPage]);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const response = await getFavoritesApi({
                page: currentPage,
                limit: ITEMS_PER_PAGE
            });
            setFavorites(response.exams || []);
            setPagination(response.pagination || null);
        } catch (error) {
            console.error('Erreur lors du chargement des favoris:', error);
            toast.error('Erreur lors du chargement des favoris');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-50' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <Loader2 className={`animate-spin ${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={48} />
                    </div>
                    <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Chargement de vos favoris...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-50' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
            {/* Header Section */}
            <div className={`backdrop-blur-lg border-b sticky top-0 z-10 ${isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                                <div className="relative bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-full shadow-lg">
                                    <Heart className="fill-white text-white" size={24} />
                                </div>
                            </div>
                            <div>
                                <h1 className={`text-2xl sm:text-3xl font-bold bg-clip-text text-transparent ${isDark ? 'bg-gradient-to-r from-white via-gray-200 to-white' : 'bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900'}`}>
                                    Mes Favoris
                                </h1>
                                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {pagination?.total || 0} examen{(pagination?.total || 0) > 1 ? 's' : ''} en favori
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/examens')}
                                className={`hidden sm:flex items-center gap-2 px-4 py-2 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${isDark ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
                            >
                                <Search size={18} />
                                <span>Explorer</span>
                            </button>
                            <button
                                onClick={() => navigate('/examens')}
                                className={`sm:hidden p-2 text-white rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}
                            >
                                <Search size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {favorites.length === 0 ? (
                    <div className={`backdrop-blur-lg rounded-3xl shadow-xl p-12 text-center border ${isDark ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/70 border-gray-200/50'}`}>
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-full blur-2xl opacity-20"></div>
                            <div className={`relative p-8 rounded-full ${isDark ? 'bg-gradient-to-r from-red-900/30 to-pink-900/30' : 'bg-gradient-to-r from-red-100 to-pink-100'}`}>
                                <Heart className={isDark ? 'text-red-300' : 'text-red-400'} size={80} strokeWidth={1.5} />
                            </div>
                        </div>
                        <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Aucun favori pour le moment</h2>
                        <p className={`mb-8 max-w-md mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            Commencez à explorer les examens et ajoutez vos préférés à cette collection pour y accéder facilement
                        </p>
                        <button
                            onClick={() => navigate('/examens')}
                            className={`group relative inline-flex items-center gap-3 px-8 py-4 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${isDark ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
                        >
                            <span>Découvrir les examens</span>
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {favorites.map((exam, index) => (
                                <div
                                    key={exam._id}
                                    className="animate-fade-in"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <CardExam exam={exam} />
                                </div>
                            ))}
                        </div>

                        {/* Modern Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-12">
                                <div className={`flex items-center justify-center gap-2 backdrop-blur-lg rounded-2xl p-2 shadow-lg border max-w-fit mx-auto ${isDark ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/70 border-gray-200/50'}`}>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={!pagination.hasPrevPage}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${isDark ? 'text-gray-300 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-indigo-900/30 disabled:hover:bg-transparent' : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 disabled:hover:bg-transparent'}`}
                                    >
                                        <ChevronLeft size={20} />
                                        <span className="hidden sm:inline">Précédent</span>
                                    </button>
                                    
                                    <div className="flex items-center gap-1 px-2">
                                        {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                                            let pageNum;
                                            if (pagination.totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= pagination.totalPages - 2) {
                                                pageNum = pagination.totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                                                        currentPage === pageNum
                                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                                            : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={!pagination.hasNextPage}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${isDark ? 'text-gray-300 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-indigo-900/30 disabled:hover:bg-transparent' : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 disabled:hover:bg-transparent'}`}
                                    >
                                        <span className="hidden sm:inline">Suivant</span>
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                                <p className={`text-center text-sm mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Page {pagination.currentPage} sur {pagination.totalPages} • {pagination.total} examen{(pagination.total || 0) > 1 ? 's' : ''}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function Favorites() {
    return (
        <ProtectedRoute>
            <FavoritesContent />
        </ProtectedRoute>
    );
}
