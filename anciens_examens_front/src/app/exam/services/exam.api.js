import api from '@/api/api';

// ================ EXAMS ================

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
        if (params.niveau) queryParams.append('niveau', params.niveau);
        if (params.semestre) queryParams.append('semestre', params.semestre);
        if (params.anneeExamen) queryParams.append('anneeExamen', params.anneeExamen);
        if (params.typeExamen) queryParams.append('typeExamen', params.typeExamen);
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

// =================== UFRs, Filieres, Niveaux ===================

// Récupérer toutes les UFR
export const getAllUfrs = async () => {
    try {
        const response = await api.get('/ufrs');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Récupérer les filières par UFR
export const getFilieresByUfr = async (ufr) => {
    try {
        const response = await api.get(`/ufrs/${encodeURIComponent(ufr)}/filieres`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Récupérer les niveaux par filière
export const getNiveauxByFiliere = async (ufr, filiere) => {
    try {
        const response = await api.get(`/ufrs/${encodeURIComponent(ufr)}/filieres/${encodeURIComponent(filiere)}/niveaux`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// =================== LIKES ===================

// Vérifier si l'utilisateur a liké un examen
export const getLikeStatus = async (slug) => {
    try {
        const response = await api.get(`/exams/${slug}/like/status`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Liker un examen
export const likeExam = async (slug) => {
    try {
        const response = await api.post(`/exams/${slug}/like`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Unliker un examen
export const unlikeExam = async (slug) => {
    try {
        const response = await api.delete(`/exams/${slug}/like`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// =================== COMMENTAIRES ===================

// Récupérer les commentaires d'un examen
export const getComments = async (slug) => {
    try {
        const response = await api.get(`/exams/${slug}/comments`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Ajouter un commentaire
export const addComment = async (slug, content) => {
    try {
        const response = await api.post(`/exams/${slug}/comments`, { content });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Supprimer un commentaire
export const deleteComment = async (slug, commentId) => {
    try {
        const response = await api.delete(`/exams/${slug}/comments/${commentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
