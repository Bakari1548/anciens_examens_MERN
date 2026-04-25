// Token storage utilities
export const tokenStorage = {
  // Stocker le token dans un cookie HTTP-only (côté serveur)
  // Pour le côté client, nous utiliserons des cookies sécurisés
  setToken: (token) => {
    if (typeof document !== 'undefined') {
      // Créer un cookie sécurisé avec les bonnes options
      const isSecure = window.location.protocol === 'https:';
      document.cookie = `auth_token=${token}; path=/; max-age=604800; secure=${isSecure}; sameSite=strict`;
    }
  },

  // Récupérer le token depuis les cookies
  getToken: () => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    }
    return null;
  },

  // Supprimer le token
  removeToken: () => {
    if (typeof document !== 'undefined') {
      const isSecure = window.location.protocol === 'https:';
    document.cookie = `auth_token=; path=/; max-age=0; secure=${isSecure}; sameSite=strict`;
    }
  },

  // Stocker les infos utilisateur (non sensibles) dans sessionStorage
  setUser: (user) => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('user', JSON.stringify(user));
    }
  },

  // Récupérer les infos utilisateur
  getUser: () => {
    if (typeof sessionStorage !== 'undefined') {
      const user = sessionStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  // Supprimer les infos utilisateur
  removeUser: () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('user');
    }
  },

  // Nettoyer tout
  clear: () => {
    tokenStorage.removeToken();
    tokenStorage.removeUser();
  }
};

// Fonction de déconnexion sécurisée
export const logout = () => {
  tokenStorage.clear();
  if (typeof window !== 'undefined') {
    // Émettre l'événement pour mettre à jour le Header
    window.dispatchEvent(new Event('user-auth-change'));
    window.location.href = '/connexion';
  }
};
