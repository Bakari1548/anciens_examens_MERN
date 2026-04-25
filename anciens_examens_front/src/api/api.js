import axios from "axios";
import { tokenStorage } from "../utils/tokenStorage";

const url = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: url,
  timeout: 10000,
  // Pas de Content-Type par défaut pour permettre multipart/form-data
});


api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Si Token expiré ou invalide déconnecte l'utilisateur
      tokenStorage.clear();
      // window.location.href = '/connexion';
    } else if (error?.response?.status === 403) {
      // Si compte désactivé ou banni, rediriger vers la page de demande
      const message = error?.response?.data?.message;
      if (message && (message.includes('désactivé') || message.includes('banni'))) {
        window.location.href = '/demande';
      }
    }
    return Promise.reject(error);
  }
);

export default api;