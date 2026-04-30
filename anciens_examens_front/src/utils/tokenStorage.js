// Token storage utilities
// Le token JWT est maintenant géré par le backend via HTTP-only cookie
// Ce fichier gère uniquement les données utilisateur non sensibles
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

  // Nettoyer tout
  clear: () => {
    tokenStorage.removeUser();
  }
};
