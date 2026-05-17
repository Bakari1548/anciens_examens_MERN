// Token storage utilities
// Le token JWT est géré par le backend via HTTP-only cookie ET stocké
// en sessionStorage en fallback pour l'envoyer via Authorization header
// (utile en cas de cookie bloqué : cross-origin, mode privé, etc.)
export const tokenStorage = {
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

  // Stocker le token JWT (fallback si cookie HTTP-only non envoyé)
  setToken: (token) => {
    if (typeof sessionStorage !== 'undefined' && token) {
      sessionStorage.setItem('auth_token', token);
    }
  },

  // Récupérer le token JWT
  getToken: () => {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem('auth_token');
    }
    return null;
  },

  // Supprimer le token
  removeToken: () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('auth_token');
    }
  },

  // Nettoyer tout
  clear: () => {
    tokenStorage.removeUser();
    tokenStorage.removeToken();
  }
};
