import { useState } from 'react';
import { Bell, Check, Trash2, Filter, Search, Clock, User, FileText, MessageSquare, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function NotificationsPanel() {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const notifications = [
    { id: 1, type: 'user', title: 'Nouvel utilisateur', message: 'John Doe vient de s\'inscrire', time: 'Il y a 5 min', read: false },
    { id: 2, type: 'exam', title: 'Nouvel examen', message: 'Mathématiques L1 a été soumis', time: 'Il y a 15 min', read: false },
    { id: 3, type: 'report', title: 'Signalement', message: 'Un examen a été signalé', time: 'Il y a 1 heure', read: true },
    { id: 4, type: 'system', title: 'Maintenance', message: 'Maintenance prévue demain', time: 'Il y a 2 heures', read: true },
  ];

  const getTypeIcon = (type) => {
    const icons = {
      user: User,
      exam: FileText,
      report: AlertTriangle,
      system: Bell,
      comment: MessageSquare
    };
    return icons[type] || Bell;
  };

  const getTypeColor = (type) => {
    const colors = {
      user: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      exam: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      report: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      system: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      comment: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
    };
    return colors[type] || colors.system;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Centre de notifications</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Check size={20} />
            Marquer tout comme lu
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
            <Trash2 size={20} />
            Effacer tout
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher une notification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les types</option>
            <option value="user">Utilisateurs</option>
            <option value="exam">Examens</option>
            <option value="report">Signalements</option>
            <option value="system">Système</option>
            <option value="comment">Commentaires</option>
          </select>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.map((notification) => {
          const Icon = getTypeIcon(notification.type);
          return (
            <div
              key={notification.id}
              className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${getTypeColor(notification.type)}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{notification.title}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock size={14} />
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{notification.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400">
                    <Check size={18} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
