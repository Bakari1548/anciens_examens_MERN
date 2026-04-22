import api from "@/api/api";
import { tokenStorage } from "@/utils/tokenStorage";
import { logout } from "@/utils/tokenStorage";

// Connexion
export const login = async (email, password) => {
    try {
        const response = await api.post('/users/login', { email, password });
        tokenStorage.setToken(response.data.token);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Inscription
export const register = async (firstName, lastName, email, password) => {
    try {
        const response = await api.post('/users/register', { firstName, lastName, email, password });
        return response.data;
    } catch (error) {
        throw error;
    }
}


// Changer le mot de passe
export const changePassword = async (oldPassword, newPassword) => {
    try {
        const response = await api.put('/users/change-password', { oldPassword, newPassword });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Mot de passe oublié
export const forgotPassword = async (email) => {
    try {
        const response = await api.post('/users/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Réinitialiser le mot de passe
export const resetPassword = async (token, newPassword) => {
    try {
        const response = await api.post(`/users/reset-password/${token}`, { newPassword });
        return response.data;
    } catch (error) {
        throw error;
    }
};
