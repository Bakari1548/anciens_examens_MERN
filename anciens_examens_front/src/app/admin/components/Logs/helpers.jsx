import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

// Formate une date ISO en chaîne lisible française
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Retourne un badge JSX pour le niveau du log
export const getLevelBadge = (level) => {
  const badges = {
    info: {
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      label: 'Info',
      icon: CheckCircle
    },
    warning: {
      color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      label: 'Warning',
      icon: AlertTriangle
    },
    error: {
      color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      label: 'Error',
      icon: XCircle
    }
  };
  const badge = badges[level] || badges.info;
  const Icon = badge.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${badge.color} rounded-full`}>
      <Icon size={12} />
      {badge.label}
    </span>
  );
};

// Retourne les classes CSS pour colorer un badge d'action
export const getActionColor = (action) => {
  const colors = {
    LOGIN: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    LOGOUT: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    REGISTER: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300',
    FAILED_LOGIN: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    REGISTER_FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    LOGIN_BANNED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    LOGIN_INACTIVE: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    PASSWORD_CHANGED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    PASSWORD_RESET_REQUEST: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    PASSWORD_RESET_SUCCESS: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    PASSWORD_RESET_FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    USER_UPDATED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    USER_DELETED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    USER_ACTIVATED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    USER_DESACTIVATED: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    USER_BANNED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    USER_UNBANNED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    EXAM_UPLOAD: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    EXAM_UPLOAD_FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    EXAM_UPDATED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    EXAM_DELETED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    EXAM_APPROVED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    EXAM_REJECTED: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    EXAM_LIKED: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300',
    EXAM_UNLIKED: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    COMMENT_ADDED: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
    COMMENT_DELETED: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    REPORT_RESOLVED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    APPEAL_SUBMITTED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    APPEAL_APPROVED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    APPEAL_REJECTED: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    AUTH_ERROR: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    SYSTEM_ERROR: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    EMAIL_FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    RATE_LIMIT: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
  };
  return colors[action] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
};
