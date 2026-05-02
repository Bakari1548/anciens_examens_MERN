import api from "@/api/api";
import { tokenStorage } from "@/utils/tokenStorage";

// Connexion
export const login = async (email, password) => {
    try {
        const response = await api.post('/users/login', { email, password });
        
        // Le token est maintenant géré par le backend via HTTP-only cookie
        // Stocker uniquement les infos utilisateur
        if (response.data.user) {
            // console.log('Login response user data:', response.data.user);
            tokenStorage.setUser(response.data.user);
            // Émettre l'événement pour mettre à jour le Header
            window.dispatchEvent(new Event('user-auth-change'));
        }
        
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Inscription
export const register = async (firstName, lastName, email, password, ufr, filiere) => {
    try {
        const response = await api.post('/users/register', { firstName, lastName, email, password, ufr, filiere });
        
        // Le token est maintenant géré par le backend via HTTP-only cookie
        // Stocker uniquement les infos utilisateur
        if (response.data.user) {
            // console.log('Register response user data:', response.data.user);
            tokenStorage.setUser(response.data.user);
            // Émettre l'événement pour mettre à jour le Header
            window.dispatchEvent(new Event('user-auth-change'));
        }
        
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Déconnexion
export const logout = async () => {
    try {
        const response = await api.post('/users/logout');
        
        // Nettoyer les données utilisateur côté client
        tokenStorage.clear();
        // Émettre l'événement pour mettre à jour le Header
        window.dispatchEvent(new Event('user-auth-change'));
        
        return response.data;
    } catch (error) {
        // Même en cas d'erreur, nettoyer les données locales
        tokenStorage.clear();
        window.dispatchEvent(new Event('user-auth-change'));
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
