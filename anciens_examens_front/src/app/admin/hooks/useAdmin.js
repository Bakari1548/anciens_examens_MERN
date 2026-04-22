import { useAdmin } from '../context/AdminContext';

export function useAdminAuth() {
  const { user, loading, error } = useAdmin();
  
  return {
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator',
    isLoading: loading,
    error,
    user
  };
}

export function useAdminStats() {
  const { stats, fetchStats, loading } = useAdmin();
  
  return {
    stats,
    fetchStats,
    loading,
    // Statistiques calculées
    userGrowthRate: stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0,
    examApprovalRate: stats.totalExams > 0 ? (((stats.totalExams - stats.pendingExams) / stats.totalExams) * 100).toFixed(1) : 0,
    reportResolutionRate: stats.reports > 0 ? 0 : 100 // À calculer selon les résolus
  };
}

export function useAdminUsers() {
  const { users, fetchUsers, updateUser, deleteUser, toggleUserStatus, loading, addNotification } = useAdmin();
  
  const banUser = async (userId, duration, reason) => {
    try {
      // Appel API pour bannir
      await updateUser(userId, { banned: true, banReason: reason, banDuration: duration });
      addNotification({
        type: 'warning',
        message: `Utilisateur banni pour ${duration} jours`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors du bannissement'
      });
    }
  };
  
  const unbanUser = async (userId) => {
    try {
      await updateUser(userId, { banned: false, banReason: null, banDuration: null });
      addNotification({
        type: 'success',
        message: 'Utilisateur débanni'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors du débannissement'
      });
    }
  };
  
  return {
    users,
    fetchUsers,
    updateUser,
    deleteUser,
    toggleUserStatus,
    banUser,
    unbanUser,
    loading
  };
}

export function useAdminExams() {
  const { exams, fetchExams, approveExam, rejectExam, deleteExam, loading, addNotification } = useAdmin();
  
  const bulkApprove = async (examIds) => {
    try {
      for (const examId of examIds) {
        await approveExam(examId);
      }
      addNotification({
        type: 'success',
        message: `${examIds.length} examens approuvés`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors de l\'approbation en masse'
      });
    }
  };
  
  const bulkReject = async (examIds, reason) => {
    try {
      for (const examId of examIds) {
        await rejectExam(examId, reason);
      }
      addNotification({
        type: 'success',
        message: `${examIds.length} examens rejetés`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors du rejet en masse'
      });
    }
  };
  
  return {
    exams,
    fetchExams,
    approveExam,
    rejectExam,
    deleteExam,
    bulkApprove,
    bulkReject,
    loading
  };
}

export function useAdminModeration() {
  const { reports, fetchReports, resolveReport, loading, addNotification } = useAdmin();
  
  const bulkResolve = async (reportIds, resolution) => {
    try {
      for (const reportId of reportIds) {
        await resolveReport(reportId, resolution);
      }
      addNotification({
        type: 'success',
        message: `${reportIds.length} signalements résolus`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors de la résolution en masse'
      });
    }
  };
  
  return {
    reports,
    fetchReports,
    resolveReport,
    bulkResolve,
    loading
  };
}

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
