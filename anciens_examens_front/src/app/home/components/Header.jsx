import React, { useState, useEffect } from 'react';
import logoAnciensExamens from '@/assets/logo_anciens_examens.png';
import { FileText, LogIn, User, UserPlus, LogOut, Menu, X, AlertTriangle, Sun, Moon, Bell, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '@/utils/tokenStorage';
import { logout as authLogout } from '@/app/auth/services/auth.api';
import { useTheme } from '@/app/admin/context/ThemeContext';
import { useNotifications } from '@/app/user/hooks/useNotifications';
import NotificationsDropdown from '@/app/user/components/Notifications/NotificationsDropdown';

export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = tokenStorage.getUser();
    setUser(userData);

    // Écouter l'événement personnalisé de connexion/déconnexion
    const handleUserChange = () => {
      const updatedUser = tokenStorage.getUser();
      setUser(updatedUser);
    };

    window.addEventListener('user-auth-change', handleUserChange);

    return () => {
      window.removeEventListener('user-auth-change', handleUserChange);
    };
  }, []);

  const getUserInitials = (user) => {
    if (!user) return '';
    const firstName = typeof user.firstName === 'string' ? user.firstName : '';
    const lastName = typeof user.lastName === 'string' ? user.lastName : '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await authLogout();
      setUser(null);
      setIsMenuOpen(false);
      setShowLogoutModal(false);
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Même en cas d'erreur, nettoyer et rediriger
      tokenStorage.clear();
      setUser(null);
      setIsMenuOpen(false);
      setShowLogoutModal(false);
      navigate('/');
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const onNavigate = (path) => {
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className='sticky top-0 z-30 w-full px-8 flex items-center justify-between py-2 bg-white shadow'>
        {/* Partie gauche - Logo */}
        <div className='flex items-center gap-4'>
            <a href="/" className='active:scale-90 duration-200'>
                <img
                    src={logoAnciensExamens}
                    className='h-14 w-14'
                    alt="UIDT Logo"
                />
            </a>
            {/* <a href="/" className='text-xl font-bold text-gray-800 hover:text-gray-600 active:scale-95 duration-200'>Anciens Examens</a> */}
        </div>

        {/* Partie centre - Navigation */}
        <nav className='hidden text-lg md:flex items-center gap-8'>
            <button onClick={() => onNavigate('/')} className='text-gray-700 hover:text-blue-600 font-medium transition-colors'>Accueil</button>
            <button onClick={() => onNavigate('/examens')} className='text-gray-700 hover:text-blue-600 font-medium transition-colors'>Examens</button>
            <button onClick={() => onNavigate('/demandes')} className='text-gray-700 hover:text-blue-600 font-medium transition-colors'>Demandes</button>
            <button onClick={() => onNavigate('/regles')} className='text-gray-700 hover:text-blue-600 font-medium transition-colors'>Règles</button>
        </nav>

        {/* Partie droite - Menu mobile et utilisateur */}
        <div className="flex items-center gap-2">
          {/* Bouton thème */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg group hover:bg-gray-300 hover:text-white dark:hover:bg-gray-700 active:scale-80 text-gray-700 dark:text-gray-300 transition-transform"
            title={isDark ? 'Mode clair' : 'Mode sombre'}
          >
            {isDark ? <Sun className='text-white' size={20} /> : <Moon  className='text-gray-800 group-hover:text-white' size={20} />}
          </button>

          {/* Icône notifications */}
          {user && (
            <NotificationsDropdown
              trigger={
                <button
                  className="relative p-2 rounded-lg group hover:bg-gray-300 hover:text-white dark:hover:bg-gray-700 active:scale-80 text-gray-700 dark:text-gray-300 transition-transform"
                  title="Notifications"
                >
                  <Bell size={20} className='text-gray-800 group-hover:text-white' />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              }
            />
          )}

          {/* Icône favoris */}
          {user && (
            <button
              onClick={() => onNavigate('/examens/favoris')}
              className="p-2 rounded-lg group hover:bg-gray-300 hover:text-white dark:hover:bg-gray-700 active:scale-80 text-gray-700 dark:text-gray-300 transition-transform"
              title="Favoris"
            >
              <Heart size={20} className='text-gray-800 group-hover:text-white' />
            </button>
          )}

          {/* Menu hamburger mobile */}
          <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg group hover:bg-gray-100 active:scale-80 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-transform"
          >
              {isMobileMenuOpen ? 
                  <X className='text-gray-800 group-hover:text-white' size={24} /> 
                : 
                  <Menu className='text-gray-800 group-hover:text-white' size={24} />}
          </button>

          {/* Icône utilisateur */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-emerald-500 flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              {user ? (
                <span className="text-white font-bold text-sm">
                  {getUserInitials(user)}
                </span>
              ) : (
                <User className="text-white" size={20} />
              )}
            </button>

            {/* Menu déroulant */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-500">
                      <p className="flex items-center text-lg font-medium text-gray-900">
                        <User size={20} className="inline mr-2" />
                        {user?.firstName || ''} {user?.lastName || ''}
                      </p>
                      <p className="text-xs text-gray-500">{user.email || ''}</p>
                    </div>
                    <button
                      onClick={() => onNavigate('/profil')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center gap-3"
                    >
                      <User size={18} className="text-blue-600" />
                      <span>Profil</span>
                    </button>
                    <button
                      onClick={() => onNavigate('/partager-examen')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center gap-3"
                    >
                      <FileText size={18} className="text-violet-600" />
                      <span>Partager un examen</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center gap-3"
                    >
                      <LogOut size={18} className="text-red-600" />
                      <span>Se déconnecter</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigate('/inscription')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center gap-3"
                    >
                      <UserPlus size={18} className="text-violet-600" />
                      <span>Créer un compte</span>
                    </button>
                    <button
                      onClick={() => onNavigate('/connexion')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center gap-3"
                    >
                      <LogIn size={18} className="text-emerald-600" />
                      <span>Se connecter</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Overlay pour fermer le menu en cliquant à l'extérieur */}
            {isMenuOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              ></div>
            )}
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-16 z-20 bg-white md:hidden">
            <div className="flex flex-col p-4 space-y-4">
              <button
                onClick={() => onNavigate('/')}
                className="text-lg text-gray-700 hover:text-blue-600 font-medium transition-colors text-left py-2 border-b border-gray-200"
              >
                Accueil
              </button>
              <button
                onClick={() => onNavigate('/examens')}
                className="text-lg text-gray-700 hover:text-blue-600 font-medium transition-colors text-left py-2 border-b border-gray-200"
              >
                Examens
              </button>
              <button
                onClick={() => onNavigate('/demandes')}
                className="text-lg text-gray-700 hover:text-blue-600 font-medium transition-colors text-left py-2 border-b border-gray-200"
              >
                Demandes
              </button>
              <button
                onClick={() => onNavigate('/regles')}
                className="text-lg text-gray-700 hover:text-blue-600 font-medium transition-colors text-left py-2 border-b border-gray-200"
              >
                Règles
              </button>
              
              {/* Actions utilisateur en mobile */}
              {user ? (
                <>
                  <button
                    onClick={() => onNavigate('/profil')}
                    className="text-lg text-gray-700 hover:text-blue-600 font-medium transition-colors text-left py-2 border-b border-gray-200"
                  >
                    Profil
                  </button>
                  <button
                    onClick={() => onNavigate('/examens/favoris')}
                    className="text-lg text-gray-700 hover:text-blue-600 font-medium transition-colors text-left py-2 border-b border-gray-200"
                  >
                    Favoris
                  </button>
                  <button
                    onClick={() => onNavigate('/partager-examen')}
                    className="text-lg text-gray-700 hover:text-blue-600 font-medium transition-colors text-left py-2 border-b border-gray-200"
                  >
                    Partager un examen
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-lg text-red-600 hover:text-red-700 font-medium transition-colors text-left py-2"
                  >
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('/inscription')}
                    className="text-lg text-gray-700 hover:text-blue-600 font-medium transition-colors text-left py-2 border-b border-gray-200"
                  >
                    Créer un compte
                  </button>
                  <button
                    onClick={() => onNavigate('/connexion')}
                    className="text-lg text-gray-700 hover:text-blue-600 font-medium transition-colors text-left py-2"
                  >
                    Se connecter
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Modal de confirmation de déconnexion */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/70"
              onClick={cancelLogout}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <LogOut className="text-red-600" size={24} />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Confirmation de déconnexion
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        )}
    </header>
  );
}