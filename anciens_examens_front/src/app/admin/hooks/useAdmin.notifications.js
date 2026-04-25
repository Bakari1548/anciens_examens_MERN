import { useAdmin } from '../context/AdminContext';

export function useAdminNotifications() {
  const { notifications, addNotification, removeNotification, sendGlobalNotification, sendNotificationToUsers } = useAdmin();
  
  const clearAllNotifications = () => {
    notifications.forEach(notification => {
      removeNotification(notification.id);
    });
  };
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    sendGlobalNotification,
    sendNotificationToUsers,
    unreadCount: notifications.filter(n => !n.read).length
  };
}
