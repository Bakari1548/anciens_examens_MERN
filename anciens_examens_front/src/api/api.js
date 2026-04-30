import axios from "axios";
import { tokenStorage } from "../utils/tokenStorage";

const url = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: url,
  timeout: 10000,
  withCredentials: true, // Important pour envoyer les cookies HTTP-only
  // Pas de Content-Type par défaut pour permettre multipart/form-data
});


api.interceptors.request.use(
  (config) => {
    // Le token est maintenant géré par HTTP-only cookie
    // Plus besoin d'ajouter l'en-tête Authorization manuellement
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
      // Vérifier si l'utilisateur a des données locales avant de déconnecter
      const localUser = tokenStorage.getUser();
      if (!localUser) {
        // Si pas de données locales, déconnecter et rediriger
        tokenStorage.clear();
        window.location.href = '/connexion';
      }
      // Si on a des données locales, laisser le composant gérer l'erreur
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