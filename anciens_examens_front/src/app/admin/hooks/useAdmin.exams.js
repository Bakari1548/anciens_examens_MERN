import { useAdmin } from '../context/AdminContext';

export function useAdminExams() {
  const { exams, fetchExams, approveExam, rejectExam, deleteExam, addExam, loading, addNotification } = useAdmin();
  
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
    addExam,
    bulkApprove,
    bulkReject,
    loading
  };
}
