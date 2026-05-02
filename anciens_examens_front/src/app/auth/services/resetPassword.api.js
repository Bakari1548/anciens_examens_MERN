import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Demander la réinitialisation du mot de passe
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/users/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de l\'envoi de l\'email' };
  }
};

// Réinitialiser le mot de passe avec le token
export const resetPassword = async (token, password) => {
  try {
    const response = await axios.post(`${API_URL}/users/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur lors de la réinitialisation du mot de passe' };
  }
};
