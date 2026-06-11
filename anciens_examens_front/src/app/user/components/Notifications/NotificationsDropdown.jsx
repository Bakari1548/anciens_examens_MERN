import { useState, useMemo, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Search, Clock, User, AlertTriangle, Flag, MessageSquare, FileText, CheckCircle, XCircle, X } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { notificationsApi } from '../../services/notifications.api';

export default function NotificationsDropdown({ trigger }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewNotif, setViewNotif] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, deleteNotification, fetchNotifications, unreadCount } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Polling pour mettre à jour les notifications automatiquement
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const getTypeIcon = (type) => ({ 
    exam: FileText, 
    comment: MessageSquare, 
    system: Bell, 
    success: CheckCircle, 
    error: XCircle, 
    report: Flag,
    user: User,
    warning: AlertTriangle
  }[type] || Bell);
  const colorBg = (type) => ({
    warning : 'bg-yellow-500/30 text-yellow-600', 
    exam : 'bg-blue-300/30 text-blue-500',
    report : 'bg-teal-500/30 text-teal-600',
    comment : 'bg-violet-500/30 text-violet-500', 
    system : 'bg-blue-500/30 text-blue-600', 
    success : 'bg-green-500/30 text-green-600', 
    user : 'bg-cyan-500/30 text-cyan-600',
    error : 'bg-red-500/30 text-red-600'
  }[type] || 'bg-gray-500/30 text-gray-600');

  const formatTime = (timestamp) => {
    const diff = Date.now() - new Date(timestamp);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'À l\'instant';
    if (m < 60) return `Il y a ${m} min`;
    if (m < 1440) return `Il y a ${Math.floor(m / 60)} h`;
    return new Date(timestamp).toLocaleDateString('fr-FR');
  };

  const handleDelete = async (id) => {
    await notificationsApi.deleteNotification(id);
    deleteNotification(id);
  };

  const handleMarkAsRead = async (notification) => {
    try {
      await notificationsApi.markAsRead(notification._id);
      await fetchNotifications();
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      await fetchNotifications();
    } catch (error) {
      console.error('Erreur lors du marquage tout comme lu:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="fixed md:absolute left-2 right-2 md:left-auto md:right-0 top-[72px] md:top-auto md:mt-2 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[70vh] md:max-h-[500px] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <span className="text-sm text-gray-500">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Tout lire
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Aucune notification</div>
              ) : (
                notifications.map((n) => {
                  const Icon = getTypeIcon(n.type);
                  return (
                    <div 
                      onClick={() => setViewNotif(!viewNotif)}
                      key={n._id} 
                      className={`flex group items-start gap-3 p-4 hover:bg-gray-50 ${!n.read ? '' : ''}`}
                    >
                      <div className={`p-2 rounded-lg ${!n.read ? colorBg(n.type) : 'bg-gray-100 text-gray-600'}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title || n.type}</p>
                        <p className={`text-sm text-gray-500 ${!viewNotif ? 'line-clamp-6' : 'line-clamp-2'}`}>{n.message}</p>
                        <span className="text-xs text-gray-400">{formatTime(n.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {!n.read && (
                          <button onClick={() => handleMarkAsRead(n)} className="p-1 hover:bg-green-100 text-gray-400 hover:text-green-600" title="Marquer comme lu">
                            <Check size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(n._id)} className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-600" title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
