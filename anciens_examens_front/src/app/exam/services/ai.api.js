import api from '@/api/api';

/**
 * Feature #1 : Analyse un fichier d'examen via IA → retourne métadonnées + extraction d'exercices
 * @param {File} file - fichier (PDF ou image)
 * @returns {Promise<{ success, metadata, aiExtraction }>}
 */
export const analyzeExamFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/ai/analyze-exam', formData, {
        timeout: 90000 // analyse IA peut être longue
    });
    return response.data;
};

/**
 * Feature #2 : Vérifie si l'examen est un doublon (comparaison document contre document)
 * @param {Object} payload - { aiExtraction: { exercises, globalSummary } }
 * @returns {Promise<{ isDuplicate, matches, checkedCount }>}
 */
export const checkDuplicate = async (payload) => {
    const response = await api.post('/ai/check-duplicate', payload, { timeout: 60000 });
    return response.data;
};

/**
 * Feature #3bis : Prépare le cache Redis avec les métadonnées IA
 * @param {string} slug - slug de l'examen
 * @returns {Promise<{ success, message }>}
 */
export const prepareChatCache = async (slug) => {
    const response = await api.post(`/ai/prepare/${slug}`, {}, { timeout: 30000 });
    return response.data;
};

/**
 * Feature #3 : Envoie un message au chatbot tuteur pédagogique
 * @param {string} slug - slug de l'examen
 * @param {string} message - message utilisateur
 * @param {Array} history - [{role: 'user'|'assistant', content: '...'}]
 * @returns {Promise<{ reply }>}
 */
export const chatWithExam = async (slug, message, history = []) => {
    const response = await api.post(`/ai/chat/${slug}`, { message, history }, { timeout: 60000 });
    return response.data;
};
