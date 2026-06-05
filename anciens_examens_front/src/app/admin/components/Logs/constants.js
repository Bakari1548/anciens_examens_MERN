// Liste de toutes les actions traçables, groupées par catégorie
export const LOG_ACTIONS = [
  {
    label: 'Authentification',
    actions: [
      { value: 'LOGIN', label: 'Connexion réussie' },
      { value: 'FAILED_LOGIN', label: 'Échec de connexion' },
      { value: 'LOGIN_BANNED', label: 'Connexion - Compte banni' },
      { value: 'LOGIN_INACTIVE', label: 'Connexion - Compte désactivé' },
      { value: 'LOGOUT', label: 'Déconnexion' },
      { value: 'REGISTER', label: 'Inscription' },
      { value: 'REGISTER_FAILED', label: "Échec d'inscription" }
    ]
  },
  {
    label: 'Mots de passe',
    actions: [
      { value: 'PASSWORD_CHANGED', label: 'Mot de passe modifié' },
      { value: 'PASSWORD_RESET_REQUEST', label: 'Demande de réinitialisation' },
      { value: 'PASSWORD_RESET_SUCCESS', label: 'Réinitialisation réussie' },
      { value: 'PASSWORD_RESET_FAILED', label: 'Échec réinitialisation' }
    ]
  },
  {
    label: 'Gestion utilisateurs',
    actions: [
      { value: 'USER_UPDATED', label: 'Utilisateur modifié' },
      { value: 'USER_DELETED', label: 'Utilisateur supprimé' },
      { value: 'USER_ACTIVATED', label: 'Utilisateur activé' },
      { value: 'USER_DESACTIVATED', label: 'Utilisateur désactivé' },
      { value: 'USER_BANNED', label: 'Utilisateur banni' },
      { value: 'USER_UNBANNED', label: 'Utilisateur débanni' }
    ]
  },
  {
    label: 'Examens',
    actions: [
      { value: 'EXAM_UPLOAD', label: "Upload d'examen" },
      { value: 'EXAM_UPLOAD_FAILED', label: "Échec d'upload" },
      { value: 'EXAM_UPDATED', label: 'Examen modifié' },
      { value: 'EXAM_DELETED', label: 'Examen supprimé' },
      { value: 'EXAM_APPROVED', label: 'Examen approuvé' },
      { value: 'EXAM_REJECTED', label: 'Examen rejeté' }
    ]
  },
  {
    label: 'Social',
    actions: [
      { value: 'EXAM_LIKED', label: 'Like ajouté' },
      { value: 'EXAM_UNLIKED', label: 'Like retiré' },
      { value: 'COMMENT_ADDED', label: 'Commentaire ajouté' },
      { value: 'COMMENT_DELETED', label: 'Commentaire supprimé' }
    ]
  },
  {
    label: 'Modération',
    actions: [
      { value: 'REPORT_RESOLVED', label: 'Signalement résolu' },
      { value: 'APPEAL_SUBMITTED', label: 'Appel soumis' },
      { value: 'APPEAL_APPROVED', label: 'Appel approuvé' },
      { value: 'APPEAL_REJECTED', label: 'Appel rejeté' }
    ]
  },
  {
    label: 'Sécurité & Système',
    actions: [
      { value: 'AUTH_ERROR', label: "Erreur d'authentification" },
      { value: 'SYSTEM_ERROR', label: 'Erreur système' },
      { value: 'EMAIL_FAILED', label: "Échec d'envoi email" }
    ]
  }
];

export const LOG_LEVELS = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' }
];
