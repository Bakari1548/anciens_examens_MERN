import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Mail, Calendar, AlertCircle } from 'lucide-react';
import { appealApi } from '../../user/services/appeal.api';
import { toast } from 'sonner';

export default function AppealsManagement() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [reviewMessage, setReviewMessage] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [action, setAction] = useState(null); // 'approve' or 'reject'

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      const response = await appealApi.getAllAppeals();
      setAppeals(response.appeals || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await appealApi.approveAppeal(selectedAppeal._id, reviewMessage);
      toast.success('Demande approuvée et compte réactivé');
      setShowReviewModal(false);
      setReviewMessage('');
      setSelectedAppeal(null);
      fetchAppeals();
    } catch (error) {
      toast.error('Erreur lors de l\'approbation de la demande');
    }
  };

  const handleReject = async () => {
    try {
      await appealApi.rejectAppeal(selectedAppeal._id, reviewMessage);
      toast.success('Demande rejetée');
      setShowReviewModal(false);
      setReviewMessage('');
      setSelectedAppeal(null);
      fetchAppeals();
    } catch (error) {
      toast.error('Erreur lors du rejet de la demande');
    }
  };

  const openReviewModal = (appeal, actionType) => {
    setSelectedAppeal(appeal);
    setAction(actionType);
    setShowReviewModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <Clock size={14} />
            En attente
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <CheckCircle size={14} />
            Approuvé
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            <XCircle size={14} />
            Rejeté
          </span>
        );
      default:
        return null;
    }
  };

  const getUserStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Actif</span>;
      case 'inactive':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Inactif</span>;
      case 'banned':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Banni</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des demandes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Consultez et gérez les demandes de réactivation de comptes</p>
        </div>
      </div>

      {appeals.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-gray-400 dark:text-gray-500" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucune demande</h3>
          <p className="text-gray-500 dark:text-gray-400">Il n'y a actuellement aucune demande à traiter.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut compte
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut demande
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {appeals.map((appeal) => (
                  <tr key={appeal._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                          <User className="text-indigo-600 dark:text-indigo-400" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {appeal.firstName} {appeal.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Mail size={14} />
                            {appeal.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getUserStatusBadge(appeal.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                        {appeal.appeal?.message || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(appeal.appeal?.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(appeal.appeal?.submittedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {appeal.appeal?.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openReviewModal(appeal, 'approve')}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Approuver"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            onClick={() => openReviewModal(appeal, 'reject')}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Rejeter"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}
                      {appeal.appeal?.status !== 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedAppeal(appeal);
                            setShowReviewModal(true);
                          }}
                          className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Voir détails
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showReviewModal && selectedAppeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {action === 'approve' ? 'Approuver la demande' : 
               action === 'reject' ? 'Rejeter la demande' : 
               'Détails de la demande'}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Utilisateur</p>
                <p className="text-gray-900 dark:text-white">
                  {selectedAppeal.firstName} {selectedAppeal.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedAppeal.email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Message de la demande</p>
                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {selectedAppeal.appeal?.message}
                </p>
              </div>

              {selectedAppeal.appeal?.reviewMessage && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Réponse de l'admin</p>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedAppeal.appeal.reviewMessage}
                  </p>
                </div>
              )}

              {selectedAppeal.appeal?.status !== 'pending' && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</p>
                  {getStatusBadge(selectedAppeal.appeal?.status)}
                </div>
              )}
            </div>

            {selectedAppeal.appeal?.status === 'pending' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message de réponse (optionnel)
                </label>
                <textarea
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ajoutez un message pour l'utilisateur..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewMessage('');
                  setSelectedAppeal(null);
                  setAction(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Annuler
              </button>
              {selectedAppeal.appeal?.status === 'pending' && (
                <button
                  onClick={action === 'approve' ? handleApprove : handleReject}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    action === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {action === 'approve' ? 'Approuver' : 'Rejeter'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
