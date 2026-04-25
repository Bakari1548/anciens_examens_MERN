import api from '@/api/api';

export const examsApi = {
  // Gestion des examens
  getExams: async (params = {}) => {
    const { page = 1, limit = 20, search, status, ufr, filiere } = params;
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(status && { status }),
      ...(ufr && { ufr }),
      ...(filiere && { filiere })
    });
    const response = await api.get(`/exams?${queryParams}`);
    return response.data;
  },

  getExamById: async (examId) => {
    const response = await api.get(`/exams/${examId}`);
    return response.data;
  },

  approveExam: async (examId) => {
    const response = await api.patch(`/admin/exams/${examId}/approve`);
    return response.data;
  },

  rejectExam: async (examId, reason) => {
    const response = await api.patch(`/admin/exams/${examId}/reject`, { reason });
    return response.data;
  },

  deleteExam: async (examId) => {
    const response = await api.delete(`/exams/${examId}`);
    return response.data;
  },

  createExam: async (formData) => {
    const response = await api.post('/exams', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
