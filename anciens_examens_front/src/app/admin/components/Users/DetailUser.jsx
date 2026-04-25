import { Eye, Edit2, Ban, Shield } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function DetailUser({ user, onClose, onEdit }) {
  const { isDark } = useTheme();
  const getStatusBadge = (user) => {
    if (user.status === 'banned') {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">Banni</span>;
    }
    if (user.status === 'active') {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">Actif</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">Inactif</span>;
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      moderator: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      user: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium ${colors[role]} rounded-full`}>
        {role === 'admin' ? 'Admin' : role === 'moderator' ? 'Modérateur' : 'Utilisateur'}
      </span>
    );
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Détails de l'utilisateur</h3>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              {getRoleBadge(user.role)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Statut</p>
              {getStatusBadge(user)}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date d'inscription</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            {user.ufr && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">UFR</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.ufr}</p>
              </div>
            )}
            {user.filiere && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Filière</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.filiere}</p>
              </div>
            )}
            {user.status === 'banned' && (
              <>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-1">Raison du bannissement</p>
                  <p className="text-sm font-medium text-red-900 dark:text-red-300">{user.banReason || 'Non spécifiée'}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-1">Date de fin de bannissement</p>
                  <p className="text-sm font-medium text-red-900 dark:text-red-300">
                    {user.banUntil ? new Date(user.banUntil).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
}
