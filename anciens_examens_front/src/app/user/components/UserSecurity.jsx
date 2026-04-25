import { Lock, LogOut } from 'lucide-react';

export default function UserSecurity({ 
  isChangingPassword, 
  passwordForm, 
  setPasswordForm, 
  handlePasswordSubmit, 
  handleLogout, 
  setIsChangingPassword 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sécurité</h1>
        <p className="text-gray-500 mt-1">Gérez la sécurité de votre compte</p>
      </div>

      <div className="space-y-6">
        {/* Password Section */}
        <div className="p-6 border border-gray-100 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Lock className="text-indigo-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Mot de passe</h3>
              <p className="text-sm text-gray-500">Changez votre mot de passe régulièrement</p>
            </div>
          </div>
          
          {isChangingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Changer le mot de passe
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Lock size={18} />
              Changer le mot de passe
            </button>
          )}
        </div>

        {/* Logout Section */}
        <div className="p-6 border border-red-100 bg-red-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <LogOut className="text-red-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Déconnexion</h3>
                <p className="text-sm text-gray-500">Vous serez redirigé vers la page de connexion</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
