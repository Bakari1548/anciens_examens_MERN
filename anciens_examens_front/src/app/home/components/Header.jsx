import React, { useState } from 'react';
import logoUIDT from '@/assets/logo_uidt.jpeg';
import { FileText, LogIn, User, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

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
              <User className="text-white" size={20} />
            </button>

            {/* Menu déroulant */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
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