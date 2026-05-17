import { useState, useEffect } from 'react';
import { notificationsApi } from '../services/notifications.api';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async (params = {}) => {
    try {
      setLoading(true);
      const response = await notificationsApi.getNotifications(params);
      console.log('Notifications reçues:', response);
      setNotifications(response.notifications || []);
      setUnreadCount((response.notifications || []).filter(n => !n.read).length);
      return response;
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      console.error('Erreur détaillée:', error.response?.data || error.message);
      return { notifications: [], total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          (n._id === notificationId || n.id === notificationId) 
            ? { ...n, read: true } 
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage tout comme lu:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      const notification = notifications.find(n => n._id === notificationId || n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => 
        prev.filter(n => n._id !== notificationId && n.id !== notificationId)
      );
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await notificationsApi.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les notifications:', error);
    }
  };

  useEffect(() => {
    console.log('useNotifications: fetchNotifications appelé');
    fetchNotifications();
    
    // Polling pour mettre à jour les notifications toutes les 60 secondes
    const interval = setInterval(() => {
      console.log('useNotifications: polling notifications');
      fetchNotifications();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  };
}
