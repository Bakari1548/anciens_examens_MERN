import axios from "axios";
import { tokenStorage } from "../utils/tokenStorage";

const url = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: url,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
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
    }
    return Promise.reject(error);
  }
);

export default api;