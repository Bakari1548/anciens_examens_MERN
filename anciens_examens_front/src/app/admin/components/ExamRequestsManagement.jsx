import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  CheckCircle, XCircle, Clock, Loader2, User, Mail, Calendar,
  MessageSquare, Search, BookOpen, Building2, GraduationCap, Send
} from 'lucide-react';
import {
  getAllExamRequests,
  getExamRequestById,
  updateExamRequestStatus,
  addExamRequestMessage
} from '../../exam/services/examRequest.api';

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
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return `${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
};

export default function ExamRequestsManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [statusDraft, setStatusDraft] = useState('pending');
  const [adminMessageDraft, setAdminMessageDraft] = useState('');
  const [updating, setUpdating] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllExamRequests({
        page: currentPage,
        limit: 10,
        status,
        search: searchQuery.trim() || undefined
      });
      setRequests(response.requests || []);
      setPagination(response.pagination || null);
    } catch {
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  }, [currentPage, status, searchQuery]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRequests();
  };

  const openDetail = async (request) => {
    setShowModal(true);
    setDetailLoading(true);
    try {
      const response = await getExamRequestById(request._id);
      setSelectedRequest(response.request);
      setStatusDraft(response.request?.status || 'pending');
      setAdminMessageDraft(response.request?.adminMessage || '');
    } catch {
      toast.error('Erreur lors du chargement de la demande');
      setShowModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setReplyMessage('');
  };

  const refreshDetail = async () => {
    if (!selectedRequest) return;
    const response = await getExamRequestById(selectedRequest._id);
    setSelectedRequest(response.request);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;
    try {
      setUpdating(true);
      await updateExamRequestStatus(selectedRequest._id, {
        status: statusDraft,
        adminMessage: adminMessageDraft
      });
      toast.success('Statut mis à jour');
      await refreshDetail();
      fetchRequests();
    } catch {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedRequest) return;
    try {
      setSendingReply(true);
      await addExamRequestMessage(selectedRequest._id, replyMessage.trim());
      setReplyMessage('');
      await refreshDetail();
      fetchRequests();
    } catch {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Demandes d'examens</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Consultez et répondez aux demandes d'examens soumises par la communauté
          </p>
        </div>
      </div>

      {/* Recherche et filtres */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par matière, demandeur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          {STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-6 py-2.5 bg-gray-900 dark:bg-indigo-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-indigo-700 transition-colors font-medium"
        >
          Filtrer
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="text-gray-400 dark:text-gray-500" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucune demande</h3>
          <p className="text-gray-500 dark:text-gray-400">Il n'y a actuellement aucune demande d'examen à traiter.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Demandeur</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Matière</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">UFR / Filière</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Messages</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                          <User className="text-indigo-600 dark:text-indigo-400" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{req.requesterName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Mail size={14} /> {req.requesterEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        <BookOpen size={14} /> {req.matiere}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{req.niveau} - {req.semestre}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Building2 size={14} /> {req.ufr}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <GraduationCap size={14} /> {req.filiere}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                        <MessageSquare size={14} /> {req.messages?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar size={14} /> {new Date(req.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDetail(req)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                      >
                        Voir / Répondre
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={pagination.currentPage <= 1}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.currentPage} sur {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Modal détail + réponse */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Demande d'examen</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XCircle size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {detailLoading || !selectedRequest ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Infos demandeur + demande */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    Détails de la demande
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Demandeur</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.requesterName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.requesterEmail}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Matière</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.matiere}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">UFR / Filière</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.ufr} - {selectedRequest.filiere}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Niveau / Semestre</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.niveau} - {selectedRequest.semestre}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Soumise le</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(selectedRequest.createdAt)}</p>
                    </div>
                  </div>
                  {selectedRequest.description && (
                    <div className="mt-4">
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Précisions</p>
                      <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-sm">
                        {selectedRequest.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Gestion du statut */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    Statut & réponse officielle
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Statut actuel</span>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nouveau statut
                    </label>
                    <select
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      {STATUS_OPTIONS.filter(o => o.value).map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message aux abonnés (optionnel)
                    </label>
                    <textarea
                      value={adminMessageDraft}
                      onChange={(e) => setAdminMessageDraft(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Ex: Nous avons ajouté cet examen, consultez la liste !"
                    />
                  </div>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Mettre à jour
                  </button>
                </div>

                {/* Fil de discussion */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    Discussion ({selectedRequest.messages?.length || 0})
                  </h3>
                  <div className="space-y-3 mb-4 max-h-56 overflow-y-auto">
                    {(selectedRequest.messages || []).length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-6">
                        Aucun message pour le moment.
                      </p>
                    ) : (
                      selectedRequest.messages.map((msg, index) => (
                        <div key={msg._id || index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900 dark:text-white">{msg.authorName}</span>
                            <span className="text-xs text-gray-400">{formatDateTime(msg.createdAt)}</span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendReply} className="flex gap-3 items-start">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={2}
                      maxLength={2000}
                      placeholder="Répondre en tant qu'administrateur..."
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    <button
                      type="submit"
                      disabled={sendingReply}
                      className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {sendingReply ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
