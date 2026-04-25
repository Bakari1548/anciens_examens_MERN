import { useEffect, useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertTriangle, MessageSquare, User, FileText, ChevronLeft, ChevronRight, Eye, Ban, Shield } from 'lucide-react';
import { useAdminModeration } from '../../hooks/useAdmin.moderation';
import { useTheme } from '../../context/ThemeContext';

export default function ModerationPanel() {
  const { isDark } = useTheme();
  const { reports, fetchReports, resolveReport, bulkResolve, loading } = useAdminModeration();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedReports, setSelectedReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showReportModal, setShowReportModal] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(null);

  useEffect(() => {
    fetchReports({
      page: currentPage,
      limit: 25, // ou 35, 50 selon le choix
      search: searchTerm,
      status: filterStatus,
      type: filterType
    });
  }, [currentPage, searchTerm, filterStatus, filterType]);

  const handleSelectReport = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reports.map(report => report._id));
    }
  };

  const handleResolve = async (reportId, resolution) => {
    await resolveReport(reportId, resolution);
    setShowResolveModal(null);
  };

  const handleBulkResolve = async (resolution) => {
    await bulkResolve(selectedReports, resolution);
    setSelectedReports([]);
    setShowResolveModal(null);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.reportedBy?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.targetUser?.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || report.status === filterStatus;
    const matchesType = !filterType || report.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', label: 'En attente', icon: Clock },
      resolved: { color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', label: 'Résolu', icon: CheckCircle },
      dismissed: { color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300', label: 'Rejeté', icon: XCircle }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${badge.color} rounded-full`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const badges = {
      user: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', label: 'Utilisateur', icon: User },
      exam: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', label: 'Examen', icon: FileText },
      comment: { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300', label: 'Commentaire', icon: MessageSquare }
    };
    const badge = badges[type] || badges.user;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${badge.color} rounded-full`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      medium: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
      high: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
      critical: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
    };
    return colors[severity] || colors.low;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Modération</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{reports.length} signalements au total</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <AlertTriangle size={20} />
            Configurer les règles
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {reports.filter(r => r.status === 'pending').length}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">En attente</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {reports.filter(r => r.status === 'resolved').length}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Résolus</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <User className="text-red-600 dark:text-red-400" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {reports.filter(r => r.type === 'user').length}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Signalements utilisateurs</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="text-blue-600 dark:text-blue-400" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {reports.filter(r => r.type === 'exam').length}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Signalements examens</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher un signalement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="resolved">Résolu</option>
            <option value="dismissed">Rejeté</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les types</option>
            <option value="user">Utilisateur</option>
            <option value="exam">Examen</option>
            <option value="comment">Commentaire</option>
          </select>
        </div>
      </div>

      {/* Actions groupées */}
      {selectedReports.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-900 dark:text-blue-300">
              {selectedReports.length} signalement{selectedReports.length > 1 ? 's' : ''} sélectionné{selectedReports.length > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResolveModal('bulk-resolve')}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Résoudre
              </button>
              <button
                onClick={() => setShowResolveModal('bulk-dismiss')}
                className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Rejeter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des signalements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedReports.length === reports.length && reports.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Signalement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cible
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sévérité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report._id)}
                      onChange={() => handleSelectReport(report._id)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white max-w-xs truncate">
                        {report.reason}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Par {report.reportedBy?.firstName} {report.reportedBy?.lastName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {report.type === 'user' && (
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                          {report.targetUser?.firstName?.charAt(0)}{report.targetUser?.lastName?.charAt(0)}
                        </div>
                      )}
                      <div className="text-sm text-gray-900 dark:text-white">
                        {report.type === 'user' 
                          ? `${report.targetUser?.firstName} ${report.targetUser?.lastName}`
                          : report.type === 'exam'
                          ? report.targetExam?.title
                          : report.targetComment?.content?.substring(0, 50) + '...'
                        }
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getTypeBadge(report.type)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(report.severity)}`}>
                      {report.severity === 'low' ? 'Faible' : report.severity === 'medium' ? 'Moyen' : report.severity === 'high' ? 'Élevé' : 'Critique'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowReportModal(report)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Voir les détails"
                      >
                        <Eye size={16} />
                      </button>
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setShowResolveModal({ type: 'resolve', report })}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                            title="Résoudre"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => setShowResolveModal({ type: 'dismiss', report })}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                            title="Rejeter"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {report.type === 'user' && report.status === 'pending' && (
                        <button
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Bannir l'utilisateur"
                        >
                          <Ban size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {(currentPage - 1) * 20 + 1} à {Math.min(currentPage * 20, filteredReports.length)} sur {filteredReports.length} signalements
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={filteredReports.length < 20}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de résolution */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {showResolveModal.type === 'resolve' ? 'Résoudre' : 'Rejeter'} 
              {showResolveModal.report ? ' ce signalement' : ' les signalements sélectionnés'}
            </h3>
            <textarea
              placeholder="Action entreprise et raison..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setShowResolveModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const resolution = document.querySelector('textarea').value;
                  if (resolution.trim()) {
                    if (showResolveModal.report) {
                      handleResolve(showResolveModal.report._id, resolution);
                    } else {
                      handleBulkResolve(resolution);
                    }
                  }
                }}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  showResolveModal.type === 'resolve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {showResolveModal.type === 'resolve' ? 'Résoudre' : 'Rejeter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
