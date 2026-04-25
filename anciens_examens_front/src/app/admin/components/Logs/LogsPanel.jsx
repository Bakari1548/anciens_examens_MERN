import { useState } from 'react';
import { FileText, Search, Filter, Download, Calendar, Clock, User, AlertTriangle, CheckCircle, XCircle, Shield, Database } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function LogsPanel() {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const logs = [
    { id: 1, level: 'info', action: 'LOGIN', user: 'John Doe', message: 'Connexion réussie', timestamp: '2024-04-24 14:30:00', ip: '192.168.1.1' },
    { id: 2, level: 'warning', action: 'FAILED_LOGIN', user: 'Unknown', message: 'Tentative de connexion échouée', timestamp: '2024-04-24 14:25:00', ip: '192.168.1.2' },
    { id: 3, level: 'info', action: 'EXAM_UPLOAD', user: 'Jane Smith', message: 'Upload examen Mathématiques L1', timestamp: '2024-04-24 14:20:00', ip: '192.168.1.3' },
    { id: 4, level: 'error', action: 'SYSTEM_ERROR', user: 'System', message: 'Erreur de base de données', timestamp: '2024-04-24 14:15:00', ip: 'localhost' },
    { id: 5, level: 'info', action: 'USER_CREATED', user: 'Admin', message: 'Création utilisateur Bob Wilson', timestamp: '2024-04-24 14:10:00', ip: '192.168.1.1' },
    { id: 6, level: 'warning', action: 'RATE_LIMIT', user: 'Unknown', message: 'Limite de taux dépassée', timestamp: '2024-04-24 14:05:00', ip: '192.168.1.4' },
    { id: 7, level: 'info', action: 'EXAM_APPROVED', user: 'Admin', message: 'Approbation examen Physique L2', timestamp: '2024-04-24 14:00:00', ip: '192.168.1.1' },
    { id: 8, level: 'error', action: 'AUTH_ERROR', user: 'Unknown', message: 'Token invalide', timestamp: '2024-04-24 13:55:00', ip: '192.168.1.5' },
  ];

  const getLevelBadge = (level) => {
    const badges = {
      info: { color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300', label: 'Info', icon: CheckCircle },
      warning: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', label: 'Warning', icon: AlertTriangle },
      error: { color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', label: 'Error', icon: XCircle }
    };
    const badge = badges[level] || badges.info;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${badge.color} rounded-full`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const getActionColor = (action) => {
    const colors = {
      LOGIN: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      FAILED_LOGIN: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      EXAM_UPLOAD: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      SYSTEM_ERROR: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      USER_CREATED: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300',
      RATE_LIMIT: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      EXAM_APPROVED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      AUTH_ERROR: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
    };
    return colors[action] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Logs système</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Audit et journalisation des événements</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download size={20} />
            Exporter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="text-blue-600 dark:text-blue-400" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {logs.length}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total logs</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {logs.filter(l => l.level === 'info').length}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Info</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {logs.filter(l => l.level === 'warning').length}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Warnings</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <XCircle className="text-red-600 dark:text-red-400" size={24} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {logs.filter(l => l.level === 'error').length}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Erreurs</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher dans les logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les niveaux</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les actions</option>
            <option value="LOGIN">Connexion</option>
            <option value="FAILED_LOGIN">Échec connexion</option>
            <option value="EXAM_UPLOAD">Upload examen</option>
            <option value="USER_CREATED">Création utilisateur</option>
            <option value="EXAM_APPROVED">Approbation examen</option>
          </select>
        </div>
      </div>

      {/* Tableau des logs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Niveau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getLevelBadge(log.level)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      {log.user}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {log.message}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {log.ip}
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
            Affichage de 1 à {logs.length} sur {logs.length} logs
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={logs.length < 20}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
