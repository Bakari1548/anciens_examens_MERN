import api from '@/api/api';

// Récupérer tous les examens avec filtres et pagination
export const getAllExams = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        // Ajouter les paramètres de pagination
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        
        // Ajouter les paramètres de tri
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        // Ajouter les filtres
        if (params.filiere) queryParams.append('filiere', params.filiere);
        if (params.ufr) queryParams.append('ufr', params.ufr);
        if (params.matiere) queryParams.append('matiere', params.matiere);
        if (params.year) queryParams.append('year', params.year);
        
        // Ajouter la recherche
        if (params.search) queryParams.append('search', params.search);
        
        const queryString = queryParams.toString();
        const url = queryString ? `/exams?${queryString}` : '/exams';
        
        const response = await api.get(url);
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
