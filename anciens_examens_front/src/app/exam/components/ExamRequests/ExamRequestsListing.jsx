import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Plus, Search, MessageSquare, Clock, CheckCircle, XCircle,
    Loader2, BookOpen, GraduationCap, Building2, Calendar, Users
} from 'lucide-react';
import { getAllExamRequests } from '../../services/examRequest.api';
import NewExamRequestModal from './NewExamRequestModal';

const STATUS_OPTIONS = [
    { value: '', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'fulfilled', label: 'Résolue' },
    { value: 'rejected', label: 'Rejetée' },
];

const getStatusBadge = (status) => {
    switch (status) {
        case 'pending':
            return (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                    <Clock size={13} /> En attente
                </span>
            );
        case 'in_progress':
            return (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    <Loader2 size={13} /> En cours
                </span>
            );
        case 'fulfilled':
            return (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <CheckCircle size={13} /> Résolue
                </span>
            );
        case 'rejected':
            return (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    <XCircle size={13} /> Rejetée
                </span>
            );
        default:
            return null;
    }
};

const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days < 7) return `Il y a ${days} j`;
    return time.toLocaleDateString('fr-FR');
};

export default function ExamRequestsListing() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [status, setStatus] = useState('');
    const [showNewModal, setShowNewModal] = useState(false);

    const ITEMS_PER_PAGE = 10;

    const loadRequests = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllExamRequests({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                status,
                search: searchQuery.trim() || undefined
            });
            setRequests(response.requests || []);
            setPagination(response.pagination || null);
        } catch (error) {
            toast.error('Erreur lors du chargement des demandes');
        } finally {
            setLoading(false);
        }
    }, [currentPage, status, searchQuery]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadRequests();
    };

    const handleCreated = (newRequest) => {
        setShowNewModal(false);
        if (newRequest?._id) {
            navigate(`/demandes/${newRequest._id}`);
        } else {
            loadRequests();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Demandes d'examens
                        </h1>
                        <p className="text-gray-600">
                            Demandez un anciens examen à la communauté d'Anciens Examens de l'UIDT.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <Plus size={18} />
                        Demande un examen   
                    </button>
                </div>

                {/* Recherche et filtres */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher une matière, une demande..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            {STATUS_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                        >
                            Filtrer
                        </button>
                    </form>
                </div>

                {/* Liste des demandes */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-600">Chargement des demandes...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                        <MessageSquare size={56} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune demande pour le moment</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Soyez le premier à demander un examen à la communauté !
                        </p>
                        <button
                            onClick={() => setShowNewModal(true)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Créer une demande
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {requests.map((req) => (
                            <button
                                key={req._id}
                                onClick={() => navigate(`/demandes/${req._id}`)}
                                className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <h3 className="text-lg font-semibold text-gray-900">{req.matiere}</h3>
                                            {getStatusBadge(req.status)}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Building2 size={14} /> {req.ufr}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <GraduationCap size={14} /> {req.filiere} - {req.niveau}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} /> {req.semestre}
                                            </span>
                                        </div>
                                        {req.description && (
                                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{req.description}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2 text-sm text-gray-500 whitespace-nowrap">
                                        <span className="flex items-center gap-1">
                                            <MessageSquare size={14} /> {req.messages?.length || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users size={14} /> {req.requesterName}
                                        </span>
                                        <span>{formatRelativeTime(req.updatedAt || req.createdAt)}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={pagination.currentPage <= 1}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Précédent
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {pagination.currentPage} sur {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={pagination.currentPage >= pagination.totalPages}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Suivant
                        </button>
                    </div>
                )}
            </div>

            {showNewModal && (
                <NewExamRequestModal
                    onClose={() => setShowNewModal(false)}
                    onCreated={handleCreated}
                />
            )}
        </div>
    );
}
