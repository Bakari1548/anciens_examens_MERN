import { useAdmin } from '../context/AdminContext';

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
