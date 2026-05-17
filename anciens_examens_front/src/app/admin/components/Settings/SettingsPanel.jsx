import { useState, useEffect } from 'react';
import { Settings, Save, Bell, Shield, Palette, Globe, User, FileText, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import { changePassword } from '../../../auth/services/auth.api';

const GENERAL_KEY = 'admin_settings_general';
const NOTIFS_KEY = 'admin_settings_notifications';

const defaultGeneral = {
  siteName: 'Anciens Examens',
  contactEmail: 'onboarding@anciensexamensuidt.app',
  phone: '+221 76 820 41 60',
  address: 'Thies, Sénégal',
};

const defaultNotifs = {
  newUsers: true,
  newExams: true,
  reports: true,
};

export default function SettingsPanel() {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');

  // Général
  const [general, setGeneral] = useState(defaultGeneral);
  const [savingGeneral, setSavingGeneral] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState(defaultNotifs);
  const [savingNotifs, setSavingNotifs] = useState(false);

  // Sécurité
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // Charger les préférences depuis localStorage
  useEffect(() => {
    try {
      const g = localStorage.getItem(GENERAL_KEY);
      if (g) setGeneral({ ...defaultGeneral, ...JSON.parse(g) });
      const n = localStorage.getItem(NOTIFS_KEY);
      if (n) setNotifs({ ...defaultNotifs, ...JSON.parse(n) });
    } catch (e) {
      console.error('Erreur chargement préférences admin:', e);
    }
  }, []);

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    setSavingGeneral(true);
    try {
      localStorage.setItem(GENERAL_KEY, JSON.stringify(general));
      toast.success('Paramètres généraux enregistrés');
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSaveNotifs = (e) => {
    e.preventDefault();
    setSavingNotifs(true);
    try {
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
      toast.success('Préférences de notification enregistrées');
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSavingNotifs(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (pwForm.next.length < 8) {
      toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      setSavingPw(true);
      await changePassword(pwForm.current, pwForm.next);
      toast.success('Mot de passe modifié avec succès');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setSavingPw(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Configuration du panneau d'administration</p>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations du site</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom du site</label>
                    <input
                      type="text"
                      value={general.siteName}
                      onChange={(e) => setGeneral({ ...general, siteName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email de contact</label>
                    <input
                      type="email"
                      value={general.contactEmail}
                      onChange={(e) => setGeneral({ ...general, contactEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={general.phone}
                      onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adresse</label>
                    <input
                      type="text"
                      value={general.address}
                      onChange={(e) => setGeneral({ ...general, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingGeneral}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {savingGeneral ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <form onSubmit={handleSaveNotifs} className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Préférences de notification</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="text-gray-600 dark:text-gray-400" size={20} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Nouveaux utilisateurs</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Recevoir une notification quand un utilisateur s'inscrit</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifs.newUsers}
                    onChange={(e) => setNotifs({ ...notifs, newUsers: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="text-gray-600 dark:text-gray-400" size={20} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Nouveaux examens</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Recevoir une notification quand un examen est soumis</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifs.newExams}
                    onChange={(e) => setNotifs({ ...notifs, newExams: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="text-gray-600 dark:text-gray-400" size={20} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Signalements</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Recevoir une notification quand un contenu est signalé</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifs.reports}
                    onChange={(e) => setNotifs({ ...notifs, reports: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingNotifs}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {savingNotifs ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paramètres de sécurité</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mot de passe actuel</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={pwForm.current}
                      onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={pwForm.next}
                      onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                      minLength={8}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmer le mot de passe</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={pwForm.confirm}
                      onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                      minLength={8}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPw}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {savingPw ? 'Modification...' : 'Modifier le mot de passe'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apparence</h3>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  {isDark ? <Globe className="text-gray-600 dark:text-gray-400" size={20} /> : <Palette className="text-gray-600 dark:text-gray-400" size={20} />}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Mode sombre</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Activer le thème sombre pour l'interface</p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDark ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDark ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
