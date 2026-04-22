import React, { useState, useEffect } from 'react';
import logoUIDT from '@/assets/logo_uidt.jpeg';
import { FileText, LogIn, User, UserPlus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '@/utils/tokenStorage';
import { logout } from '@/utils/tokenStorage';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = tokenStorage.getUser();
    setUser(userData);
  }, []);

  const getUserInitials = (user) => {
    if (!user) return '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  const onNavigate = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <header className='w-full px-8 flex items-center justify-between py-4 bg-white shadow'>
        <a href="/" className='active:scale-90 duration-200'>
            <img
                src={logoUIDT}
                className='h-14'
                alt="UIDT Logo"
            />
        </a>
        <a href="/" className='text-3xl font-bold text-gray-800 hover:text-gray-600 active:scale-95 duration-200'>Anciens Examens</a>
        {/* Avatar utilisateur */}
        <div className="flex items-center">
          <div className="relative">
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
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
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
                      onClick={() => onNavigate('/regles')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center gap-3 border-t border-gray-100"
                    >
                      <FileText size={18} className="text-gray-600" />
                      <span>Règles à respecter</span>
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
                    <button
                      onClick={() => onNavigate('/regles')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center gap-3 border-t border-gray-100"
                    >
                      <FileText size={18} className="text-gray-600" />
                      <span>Règles à respecter</span>
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
      {/* </div> */}
    </header>
  );
}