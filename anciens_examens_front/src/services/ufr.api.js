import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL  || 'http://localhost:8000/api';

// Obtenir toutes les UFR
export const getAllUfrs = async () => {
  try {
    const response = await axios.get(`${API_URL}/ufrs`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération des UFR' };
  }
};

// Obtenir les filières d'une UFR spécifique
export const getFilieresByUfr = async (ufr) => {
  try {
    const response = await axios.get(`${API_URL}/ufrs/${encodeURIComponent(ufr)}/filieres`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération des filières' };
  }
};

// Obtenir les niveaux d'une filière spécifique
export const getNiveauxByFiliere = async (ufr, filiere) => {
  try {
    const response = await axios.get(`${API_URL}/ufrs/${encodeURIComponent(ufr)}/filieres/${encodeURIComponent(filiere)}/niveaux`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la récupération des niveaux' };
  }
};
