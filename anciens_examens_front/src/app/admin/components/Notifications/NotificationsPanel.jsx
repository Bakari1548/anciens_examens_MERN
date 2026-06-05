import { useState, useMemo, useEffect } from 'react';
import { Bell, Check, Trash2, Filter, Search, Clock, User, FileText, MessageSquare, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAdminNotifications } from '../../hooks/useAdmin.notifications';
import { useAdmin } from '../../context/AdminContext';
import { notificationsApi } from '../../services/notifications.api';

export default function NotificationsPanel() {
  const { isDark } = useTheme();
  const { notifications, clearAllNotifications, removeNotification } = useAdminNotifications();
  const { fetchNotifications } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getTypeIcon = (type) => {
    const icons = {
      user: User,
      exam: FileText,
      report: AlertTriangle,
      system: Bell,
      comment: MessageSquare,
      success: CheckCircle,
      error: XCircle
    };
    return icons[type] || Bell;
  };

  const getTypeGradient = (type) => {
    const gradients = {
      user: 'from-blue-500 to-cyan-500',
      exam: 'from-emerald-500 to-teal-500',
      report: 'from-rose-500 to-pink-500',
      system: 'from-purple-500 to-violet-500',
      comment: 'from-amber-500 to-orange-500',
      success: 'from-green-500 to-emerald-500',
      error: 'from-red-500 to-rose-500'
    };
    return gradients[type] || gradients.system;
  };

  const getTypeBg = (type) => {
    const bgs = {
      user: 'bg-blue-50 dark:bg-blue-900/20',
      exam: 'bg-emerald-50 dark:bg-emerald-900/20',
      report: 'bg-rose-50 dark:bg-rose-900/20',
      system: 'bg-purple-50 dark:bg-purple-900/20',
      comment: 'bg-amber-50 dark:bg-amber-900/20',
      success: 'bg-green-50 dark:bg-green-900/20',
      error: 'bg-red-50 dark:bg-red-900/20'
    };
    return bgs[type] || bgs.system;
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp || notification.createdAt || Date.now());
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

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesSearch = notification.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notification.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || notification.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [notifications, searchTerm, filterType]);

  const handleMarkAsRead = async (notification) => {
    try {
      await notificationsApi.markAsRead(notification._id || notification.id);
      await fetchNotifications();
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      removeNotification(notificationId);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      await fetchNotifications();
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationsApi.clearAllNotifications();
      clearAllNotifications();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header moderne */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {notifications.filter(n => !n.read).length} notification{notifications.filter(n => !n.read).length > 1 ? 's' : ''} non lue{notifications.filter(n => !n.read).length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Check size={16} />
            Tout lire
          </button>
          <button 
            onClick={handleClearAll}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Trash2 size={16} />
            Effacer tout
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer"
        >
          <option value="">Tous les types</option>
          <option value="user">Utilisateurs</option>
          <option value="exam">Examens</option>
          <option value="report">Signalements</option>
          <option value="system">Système</option>
          <option value="comment">Commentaires</option>
          <option value="success">Succès</option>
          <option value="error">Erreurs</option>
        </select>
      </div>

      {/* Liste des notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Bell className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Aucune notification</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getTypeIcon(notification.type);
            const timestamp = notification.timestamp || notification.createdAt || notification.createdAt;
            return (
              <div
                key={notification.id || notification._id}
                className={`group flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
              >
                <div className={`p-2.5 rounded-lg ${!notification.read ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className={`font-medium text-sm ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notification.title || notification.type}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatTime(timestamp)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification)}
                      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
                      title="Marquer comme lu"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id || notification._id)}
                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
