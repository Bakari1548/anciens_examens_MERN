import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { 
    Search, Filter, ChevronLeft, ChevronRight, BookOpen, 
    GraduationCap, Building2, Calendar, FileText, Loader2,
    X, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
import { getAllExams } from '../services/exam.api';
import CardExam from './CardExam';
import { tokenStorage } from '@/utils/tokenStorage';

// Options pour les filtres
const UFR_OPTIONS = [
    { value: '', label: 'Toutes les UFR' },
    { value: 'UFR Sciences et Technologies', label: 'UFR Sciences et Technologies' },
    { value: 'UFR Sciences Économiques et de Gestion', label: 'UFR Sciences Économiques et de Gestion' },
    { value: 'UFR Lettres, Arts et Communication', label: 'UFR Lettres, Arts et Communication' },
    { value: 'UFR Sciences Juridiques et Politiques', label: 'UFR Sciences Juridiques et Politiques' },
];

const FILIERE_OPTIONS = [
    { value: '', label: 'Toutes les filières' },
    { value: 'L1', label: 'Licence 1' },
    { value: 'L2', label: 'Licence 2' },
    { value: 'L3', label: 'Licence 3' },
    { value: 'M1', label: 'Master 1' },
    { value: 'M2', label: 'Master 2' },
];

const SORT_OPTIONS = [
    { value: 'createdAt_desc', label: 'Plus récents' },
    { value: 'createdAt_asc', label: 'Plus anciens' },
    { value: 'title_asc', label: 'Titre A-Z' },
    { value: 'title_desc', label: 'Titre Z-A' },
];

export default function ExamsListing() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // États
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [user, setUser] = useState(null);
    const [useUserFilters, setUseUserFilters] = useState(true);
    
    // Filtres et recherche
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [filters, setFilters] = useState({
        ufr: searchParams.get('ufr') || '',
        filiere: searchParams.get('filiere') || '',
        matiere: searchParams.get('matiere') || '',
        year: searchParams.get('year') || '',
    });
    const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt_desc');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    
    const ITEMS_PER_PAGE = 12;

    // Charger les données utilisateur au montage
    useEffect(() => {
        const userData = tokenStorage.getUser();
        setUser(userData);
        
        // Appliquer les filtres de l'utilisateur si disponibles et si aucun filtre n'est déjà défini dans l'URL
        if (userData && useUserFilters) {
            const userFilters = {};
            if (userData.ufr && !searchParams.get('ufr')) {
                userFilters.ufr = userData.ufr;
            }
            // if (userData.filiere && !searchParams.get('filiere')) {
            //     userFilters.filiere = userData.filiere;
            // }
            
            if (Object.keys(userFilters).length > 0) {
                setFilters(prev => ({ ...prev, ...userFilters }));
            }
        }
    }, []);

    // Charger les examens
    const loadExams = useCallback(async () => {
        try {
            setLoading(true);
            
            const [sortBy, sortOrder] = sort.split('_');
            
            const params = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                sortBy,
                sortOrder,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '')
                ),
            };
            
            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }
            
            const response = await getAllExams(params);
            setExams(response.exams || []);
            setPagination(response.pagination || null);
        } catch (error) {
            toast.error('Erreur lors du chargement des examens');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters, searchQuery, sort]);

    // Charger les examens au montage et quand les filtres changent
    useEffect(() => {
        loadExams();
    }, [loadExams]);

    // Mettre à jour l'URL avec les filtres
    useEffect(() => {
        const params = new URLSearchParams();
        
        if (searchQuery) params.set('search', searchQuery);
        if (filters.ufr) params.set('ufr', filters.ufr);
        if (filters.filiere) params.set('filiere', filters.filiere);
        if (filters.matiere) params.set('matiere', filters.matiere);
        if (filters.year) params.set('year', filters.year);
        if (sort !== 'createdAt_desc') params.set('sort', sort);
        if (currentPage > 1) params.set('page', currentPage.toString());
        
        setSearchParams(params);
    }, [searchQuery, filters, sort, currentPage, setSearchParams]);

    // Gestionnaires d'événements
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadExams();
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const handleSortChange = (value) => {
        setSort(value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setFilters({
            ufr: '',
            filiere: '',
            matiere: '',
            year: '',
        });
        setSort('createdAt_desc');
        setCurrentPage(1);
    };

    const hasActiveFilters = searchQuery || filters.ufr || filters.filiere || filters.matiere || filters.year || sort !== 'createdAt_desc';

    // Rendu de la pagination
    const renderPagination = () => {
        if (!pagination || pagination.totalPages <= 1) return null;

        const { currentPage: page, totalPages, hasNextPage, hasPrevPage } = pagination;
        
        const getPageNumbers = () => {
            const pages = [];
            const maxVisible = 5;
            
            if (totalPages <= maxVisible) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
                if (page <= 3) {
                    for (let i = 1; i <= 4; i++) pages.push(i);
                    pages.push('...');
                    pages.push(totalPages);
                } else if (page >= totalPages - 2) {
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
                } else {
                    pages.push(1);
                    pages.push('...');
                    for (let i = page - 1; i <= page + 1; i++) pages.push(i);
                    pages.push('...');
                    pages.push(totalPages);
                }
            }
            return pages;
        };

        return (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
                <button
                    onClick={() => setCurrentPage(page - 1)}
                    disabled={!hasPrevPage}
                    className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} />
                    Précédent
                </button>
                
                {getPageNumbers().map((p, index) => (
                    <button
                        key={index}
                        onClick={() => typeof p === 'number' && setCurrentPage(p)}
                        disabled={p === '...'}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            p === page
                                ? 'bg-blue-600 text-white'
                                : p === '...'
                                ? 'cursor-default text-gray-400'
                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {p}
                    </button>
                ))}
                
                <button
                    onClick={() => setCurrentPage(page + 1)}
                    disabled={!hasNextPage}
                    className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Suivant
                    <ChevronRight size={16} />
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Tous les examens
                    </h1>
                    <p className="text-gray-600">
                        Consultez et filtrez les anciens examens partagés par la communauté
                    </p>
                </div>

                {/* Barre de recherche et filtres */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    {/* Recherche */}
                    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher par titre ou matière..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Rechercher
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <SlidersHorizontal size={20} />
                            <span className="hidden sm:inline">Filtres</span>
                            {showFilters ? <ChevronLeft size={16} className="rotate-90" /> : <ChevronRight size={16} className="rotate-90" />}
                        </button>
                    </form>

                    {/* Filtres avancés */}
                    {showFilters && (
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Filtre UFR */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Building2 size={16} />
                                        UFR
                                    </label>
                                    <select
                                        value={filters.ufr}
                                        onChange={(e) => handleFilterChange('ufr', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        {UFR_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtre Filière */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <GraduationCap size={16} />
                                        Filière
                                    </label>
                                    <select
                                        value={filters.filiere}
                                        onChange={(e) => handleFilterChange('filiere', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        {FILIERE_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtre Matière */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <BookOpen size={16} />
                                        Matière
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Mathématiques"
                                        value={filters.matiere}
                                        onChange={(e) => handleFilterChange('matiere', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Filtre Année */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Calendar size={16} />
                                        Année
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Ex: 2024"
                                        value={filters.year}
                                        onChange={(e) => handleFilterChange('year', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        min="2000"
                                        max="2100"
                                    />
                                </div>
                            </div>

                            {/* Tri et réinitialisation */}
                            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown size={16} className="text-gray-500" />
                                    <span className="text-sm text-gray-700">Trier par:</span>
                                    <select
                                        value={sort}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        {SORT_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
                                    >
                                        <X size={16} />
                                        Réinitialiser les filtres
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Résultats et statistiques */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <p className="text-gray-600">
                        {pagination ? (
                            <>
                                <span className="font-semibold text-gray-900">{pagination.total}</span> examen{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
                                {pagination.totalPages > 1 && (
                                    <span className="ml-2">
                                        - Page <span className="font-semibold">{pagination.currentPage}</span> sur {pagination.totalPages}
                                    </span>
                                )}
                            </>
                        ) : (
                            'Chargement...'
                        )}
                    </p>
                    
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2">
                            {searchQuery && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    Recherche: {searchQuery}
                                    <button onClick={() => setSearchQuery('')} className="hover:text-blue-900">
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                            {filters.ufr && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                    {filters.ufr.replace('UFR ', '')}
                                    <button onClick={() => handleFilterChange('ufr', '')} className="hover:text-green-900">
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                            {filters.filiere && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                    {filters.filiere}
                                    <button onClick={() => handleFilterChange('filiere', '')} className="hover:text-purple-900">
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                            {filters.matiere && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                    {filters.matiere}
                                    <button onClick={() => handleFilterChange('matiere', '')} className="hover:text-orange-900">
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                            {filters.year && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                                    {filters.year}
                                    <button onClick={() => handleFilterChange('year', '')} className="hover:text-pink-900">
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Grille d'examens */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-600">Chargement des examens...</p>
                    </div>
                ) : exams.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                        <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Aucun examen trouvé
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            {hasActiveFilters 
                                ? 'Aucun examen ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                                : 'Aucun examen n\'est disponible pour le moment. Soyez le premier à en partager un !'
                            }
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Réinitialiser les filtres
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {exams.map((exam) => (
                                <CardExam key={exam._id} exam={exam} />
                            ))}
                        </div>
                        
                        {/* Pagination */}
                        {renderPagination()}
                    </>
                )}
            </div>
        </div>
    );
}
