import { useAdmin } from '../context/AdminContext';

export function useAdminExams() {
  const { exams, fetchExams, approveExam: originalApproveExam, rejectExam, deleteExam, addExam, updateExam, loading, addNotification, stats } = useAdmin();

  const approveExam = async (examId, params = {}) => {
    try {
      console.log('Tentative d\'approbation examId:', examId);
      await originalApproveExam(examId);
      console.log('Approbation réussie');
      addNotification({
        type: 'success',
        message: 'Examen approuvé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      addNotification({
        type: 'error',
        message: `Erreur lors de l'approbation: ${error.response?.data?.message || error.message}`
      });
    }
  };


  const bulkApprove = async (examIds) => {
    try {
      for (const examId of examIds) {
        await originalApproveExam(examId);
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
    updateExam,
    bulkApprove,
    bulkReject,
    loading,
    stats
  };
}
