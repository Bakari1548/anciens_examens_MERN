import axios from "axios";
import { tokenStorage } from "../utils/tokenStorage";

const url = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: url,
  timeout: 120000, // 2 minutes pour les uploads mobiles lents
  withCredentials: true, // Important pour envoyer les cookies HTTP-only
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  // Pas de Content-Type par défaut pour permettre multipart/form-data
});


api.interceptors.request.use(
  (config) => {
    // Auth principale : cookie HTTP-only (envoyé via withCredentials)
    // Fallback : Authorization header avec token en sessionStorage
    // Utile si le cookie est bloqué (cross-origin, navigateur privé, etc.)
    const token = tokenStorage.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // IMPORTANT: Pour FormData, supprimer Content-Type pour laisser 
    // le navigateur le définir automatiquement avec le bon boundary multipart
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    // Vérifier si l'utilisateur est admin et rediriger si nécessaire
    tokenStorage.getUser();
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      // Vérifier si l'utilisateur a des données locales avant de déconnecter
      const localUser = tokenStorage.getUser();
      if (!localUser) {
        // Si pas de données locales, déconnecter et rediriger
        tokenStorage.clear();
        // window.location.href = '/connexion';
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
