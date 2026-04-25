import { useAdmin } from '../context/AdminContext';

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
