import { useEffect, useState } from 'react';
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Trash2, MoreVertical, ChevronLeft, ChevronRight, FileText, Calendar, User } from 'lucide-react';
import { useAdminExams } from '../../hooks/useAdmin';

export default function ExamManagement() {
  const { exams, fetchExams, approveExam, rejectExam, deleteExam, bulkApprove, bulkReject, loading } = useAdminExams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUFR, setFilterUFR] = useState('');
  const [filterFiliere, setFilterFiliere] = useState('');
  const [selectedExams, setSelectedExams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExamModal, setShowExamModal] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);

  useEffect(() => {
    fetchExams({
      page: currentPage,
      search: searchTerm,
      status: filterStatus,
      ufr: filterUFR,
      filiere: filterFiliere
    });
  }, [currentPage, searchTerm, filterStatus, filterUFR, filterFiliere]);

  const handleSelectExam = (examId) => {
    setSelectedExams(prev => 
      prev.includes(examId) 
        ? prev.filter(id => id !== examId)
        : [...prev, examId]
    );
  };

  const handleSelectAll = () => {
    if (selectedExams.length === exams.length) {
      setSelectedExams([]);
    } else {
      setSelectedExams(exams.map(exam => exam._id));
    }
  };

  const handleApprove = async (examId) => {
    await approveExam(examId);
  };

  const handleReject = async (examId, reason) => {
    await rejectExam(examId, reason);
    setShowRejectModal(null);
  };

  const handleDelete = async (examId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
      await deleteExam(examId);
    }
  };

  const handleBulkApprove = async () => {
    await bulkApprove(selectedExams);
    setSelectedExams([]);
  };

  const handleBulkReject = async (reason) => {
    await bulkReject(selectedExams, reason);
    setSelectedExams([]);
    setShowRejectModal(null);
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exam.matiere.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || exam.status === filterStatus;
    const matchesUFR = !filterUFR || exam.ufr === filterUFR;
    const matchesFiliere = !filterFiliere || exam.filiere === filterFiliere;
    return matchesSearch && matchesStatus && matchesUFR && matchesFiliere;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approuvé', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejeté', icon: XCircle }
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

  const getUFRColor = (ufr) => {
    const colors = {
      'UFR Sciences et Technologies': 'from-blue-500 to-blue-600',
      'UFR Sciences Économiques et de Gestion': 'from-green-500 to-green-600',
      'UFR Lettres, Arts et Communication': 'from-purple-500 to-purple-600',
      'UFR Sciences Juridiques et Politiques': 'from-red-500 to-red-600'
    };
    return colors[ufr] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des examens</h1>
          <p className="text-gray-600 mt-1">{exams.length} examens au total</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download size={20} />
            Exporter
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un examen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvé</option>
            <option value="rejected">Rejeté</option>
          </select>
          <select
            value={filterUFR}
            onChange={(e) => setFilterUFR(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les UFR</option>
            <option value="UFR Sciences et Technologies">UFR Sciences et Technologies</option>
            <option value="UFR Sciences Économiques et de Gestion">UFR Sciences Économiques et de Gestion</option>
            <option value="UFR Lettres, Arts et Communication">UFR Lettres, Arts et Communication</option>
            <option value="UFR Sciences Juridiques et Politiques">UFR Sciences Juridiques et Politiques</option>
          </select>
          <select
            value={filterFiliere}
            onChange={(e) => setFilterFiliere(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les filières</option>
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
            <option value="M1">M1</option>
            <option value="M2">M2</option>
          </select>
        </div>
      </div>

      {/* Actions groupées */}
      {selectedExams.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-900">
              {selectedExams.length} examen{selectedExams.length > 1 ? 's' : ''} sélectionné{selectedExams.length > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkApprove}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Approuver
              </button>
              <button
                onClick={() => setShowRejectModal('bulk')}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Rejeter
              </button>
              <button className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des examens */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedExams.length === exams.length && exams.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Examen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UFR/Filière
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExams.map((exam) => (
                <tr key={exam._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedExams.includes(exam._id)}
                      onChange={() => handleSelectExam(exam._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getUFRColor(exam.ufr)} flex items-center justify-center`}>
                        <FileText className="text-white" size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 max-w-xs truncate">
                          {exam.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {exam.matiere} - {exam.year}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                        {exam.author?.firstName?.charAt(0)}{exam.author?.lastName?.charAt(0)}
                      </div>
                      <div className="text-sm text-gray-900">
                        {exam.author?.firstName} {exam.author?.lastName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{exam.ufr?.split(' ')[1]}</div>
                      <div className="text-gray-500">{exam.filiere}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(exam.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(exam.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowExamModal(exam)}
                        className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Voir les détails"
                      >
                        <Eye size={16} />
                      </button>
                      {exam.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(exam._id)}
                            className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                            title="Approuver"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => setShowRejectModal(exam)}
                            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                            title="Rejeter"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(exam._id)}
                        className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Affichage de {(currentPage - 1) * 20 + 1} à {Math.min(currentPage * 20, filteredExams.length)} sur {filteredExams.length} examens
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-700">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={filteredExams.length < 20}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de rejet */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rejeter {showRejectModal === 'bulk' ? 'les examens sélectionnés' : 'cet examen'}
            </h3>
            <textarea
              placeholder="Raison du rejet..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const reason = document.querySelector('textarea').value;
                  if (reason.trim()) {
                    if (showRejectModal === 'bulk') {
                      handleBulkReject(reason);
                    } else {
                      handleReject(showRejectModal._id, reason);
                    }
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Rejeter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
