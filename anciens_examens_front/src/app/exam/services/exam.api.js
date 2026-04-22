import api from '@/api/api';

// Récupérer tous les examens
export const getAllExams = async () => {
    try {
        const response = await api.get('/exams');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Récupérer un examen par son slug
export const getExamBySlug = async (slug) => {
    try {
        const response = await api.get(`/exams/${slug}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Créer un nouvel examen
export const postNewExam = async (examData) => {
    try {
        const response = await api.post('/exams', examData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Mettre à jour un examen
export const updateExam = async (slug, examData) => {
    try {
        const response = await api.put(`/exams/${slug}`, examData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Supprimer un examen
export const deleteExam = async (slug) => {
    try {
        const response = await api.delete(`/exams/${slug}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
