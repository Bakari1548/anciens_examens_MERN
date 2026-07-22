import api from '@/api/api';

// ================ DEMANDES D'EXAMENS ================

// Créer une nouvelle demande d'examen
export const createExamRequest = async (payload) => {
    try {
        const response = await api.post('/exam-requests', payload);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Récupérer mes propres demandes
export const getMyExamRequests = async () => {
    try {
        const response = await api.get('/exam-requests/my');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Récupérer toutes les demandes (accessible à tous les utilisateurs connectés,
// utilisée pour le fil public façon forum)
export const getAllExamRequests = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.status) queryParams.append('status', params.status);
        if (params.ufr) queryParams.append('ufr', params.ufr);
        if (params.filiere) queryParams.append('filiere', params.filiere);
        if (params.search) queryParams.append('search', params.search);

        const queryString = queryParams.toString();
        const url = queryString ? `/exam-requests?${queryString}` : '/exam-requests';

        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Récupérer une demande avec son fil de discussion
export const getExamRequestById = async (id) => {
    try {
        const response = await api.get(`/exam-requests/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Ajouter un message dans le fil de discussion d'une demande
export const addExamRequestMessage = async (id, content) => {
    try {
        const response = await api.post(`/exam-requests/${id}/messages`, { content });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// S'abonner aux notifications d'une demande sans poster de message
export const watchExamRequest = async (id) => {
    try {
        const response = await api.post(`/exam-requests/${id}/watch`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Mettre à jour le statut d'une demande (admin uniquement)
export const updateExamRequestStatus = async (id, { status, adminMessage }) => {
    try {
        const response = await api.patch(`/exam-requests/${id}`, { status, adminMessage });
        return response.data;
    } catch (error) {
        throw error;
    }
};
