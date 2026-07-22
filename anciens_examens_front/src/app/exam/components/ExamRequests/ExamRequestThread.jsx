import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ArrowLeft, Send, Loader2, Building2, GraduationCap, Calendar,
    BookOpen, FileText, Clock, CheckCircle, XCircle, User, Bell, BellOff
} from 'lucide-react';
import {
    getExamRequestById,
    addExamRequestMessage,
    watchExamRequest,
    updateExamRequestStatus
} from '../../services/examRequest.api';
import { tokenStorage } from '@/utils/tokenStorage';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'En attente' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'fulfilled', label: 'Résolue' },
    { value: 'rejected', label: 'Rejetée' },
];

const getStatusBadge = (status) => {
    switch (status) {
        case 'pending':
            return (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                    <Clock size={14} /> En attente
                </span>
            );
        case 'in_progress':
            return (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    <Loader2 size={14} /> En cours
                </span>
            );
        case 'fulfilled':
            return (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <CheckCircle size={14} /> Résolue
                </span>
            );
        case 'rejected':
            return (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    <XCircle size={14} /> Rejetée
                </span>
            );
        default:
            return null;
    }
};

const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
};

const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    return parts.slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('');
};

export default function ExamRequestThread() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = tokenStorage.getUser();

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [watching, setWatching] = useState(false);
    const [statusDraft, setStatusDraft] = useState('');
    const [adminMessageDraft, setAdminMessageDraft] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const isAdmin = currentUser?.role === 'admin';

    const loadRequest = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getExamRequestById(id);
            setRequest(response.request);
            setStatusDraft(response.request?.status || 'pending');
            setAdminMessageDraft(response.request?.adminMessage || '');
        } catch (error) {
            toast.error('Demande introuvable');
            navigate('/demandes');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        loadRequest();
    }, [loadRequest]);

    const isWatcher = request?.watchers?.some(w => (w?._id || w) === currentUser?._id || (w?._id || w) === currentUser?.id);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error('Le message ne peut pas être vide');
            return;
        }
        try {
            setSending(true);
            await addExamRequestMessage(id, message.trim());
            setMessage('');
            await loadRequest();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de l\'envoi du message';
            toast.error(errorMessage);
        } finally {
            setSending(false);
        }
    };

    const handleWatch = async () => {
        try {
            setWatching(true);
            await watchExamRequest(id);
            toast.success('Vous suivez désormais cette demande');
            await loadRequest();
        } catch (error) {
            toast.error('Erreur lors de l\'abonnement à la demande');
        } finally {
            setWatching(false);
        }
    };

    const handleUpdateStatus = async () => {
        try {
            setUpdatingStatus(true);
            await updateExamRequestStatus(id, { status: statusDraft, adminMessage: adminMessageDraft });
            toast.success('Statut mis à jour');
            await loadRequest();
        } catch (error) {
            toast.error('Erreur lors de la mise à jour du statut');
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 size={40} className="animate-spin text-blue-600" />
            </div>
        );
    }

    if (!request) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/demandes')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Retour aux demandes
                </button>

                {/* Carte principale de la demande */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{request.matiere}</h1>
                            <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                                <span className="flex items-center gap-1"><Building2 size={14} /> {request.ufr}</span>
                                <span className="flex items-center gap-1"><GraduationCap size={14} /> {request.filiere} - {request.niveau}</span>
                                <span className="flex items-center gap-1"><Calendar size={14} /> {request.semestre}</span>
                                {request.typeExamen && (
                                    <span className="flex items-center gap-1"><FileText size={14} /> {request.typeExamen}</span>
                                )}
                                {request.anneeExamen && (
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {request.anneeExamen}</span>
                                )}
                            </div>
                        </div>
                        {getStatusBadge(request.status)}
                    </div>

                    {request.description && (
                        <p className="text-gray-700 bg-gray-50 rounded-lg p-4 mb-4">{request.description}</p>
                    )}

                    <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-xs">
                                {getInitials(request.requesterName)}
                            </div>
                            <span>Demandé par <strong className="text-gray-700">{request.requesterName}</strong> · {formatDateTime(request.createdAt)}</span>
                        </div>
                        <button
                            onClick={handleWatch}
                            disabled={watching || isWatcher}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                isWatcher
                                    ? 'bg-gray-100 text-gray-500 cursor-default'
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            }`}
                        >
                            {isWatcher ? <Bell size={16} /> : <BellOff size={16} />}
                            {isWatcher ? 'Vous suivez cette demande' : 'Suivre cette demande'}
                        </button>
                    </div>

                    {request.adminMessage && (
                        <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">
                                Réponse de l'administration
                            </p>
                            <p className="text-gray-800 text-sm">{request.adminMessage}</p>
                        </div>
                    )}
                </div>

                {/* Contrôles admin */}
                {isAdmin && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                            Gestion administrateur
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                                <select
                                    value={statusDraft}
                                    onChange={(e) => setStatusDraft(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {STATUS_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message aux abonnés (optionnel)</label>
                            <textarea
                                value={adminMessageDraft}
                                onChange={(e) => setAdminMessageDraft(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Ex: Nous avons ajouté cet examen, consultez la liste !"
                            />
                        </div>
                        <button
                            onClick={handleUpdateStatus}
                            disabled={updatingStatus}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                        >
                            {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            Mettre à jour
                        </button>
                    </div>
                )}

                {/* Fil de discussion */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Discussion ({request.messages?.length || 0})
                    </h3>

                    <div className="space-y-4 mb-6">
                        {(request.messages || []).length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">
                                Aucun message pour le moment. Soyez le premier à répondre !
                            </p>
                        ) : (
                            request.messages.map((msg, index) => (
                                <div key={msg._id || index} className="flex gap-3">
                                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-xs flex-shrink-0">
                                        {getInitials(msg.authorName)}
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="font-medium text-sm text-gray-900">{msg.authorName}</span>
                                            <span className="text-xs text-gray-400">{formatDateTime(msg.createdAt)}</span>
                                        </div>
                                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-3 items-start">
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <User size={16} />
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={2}
                                maxLength={2000}
                                placeholder="Répondre à cette demande..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    Répondre
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
