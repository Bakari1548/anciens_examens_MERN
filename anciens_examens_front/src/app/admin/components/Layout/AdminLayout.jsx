import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Flag, 
  BarChart3, 
  Settings, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  Shield,
  FileText,
  MessageSquare,
  Moon,
  Sun,
  AlertCircle
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useAdminNotifications } from '../../hooks/useAdmin.notifications';
import { useTheme } from '../../context/ThemeContext';
import logoAnciensExamens from '../../../../assets/logo_anciens_examens.png';



export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, addNotification } = useAdmin();
  const { notifications, unreadCount, clearAllNotifications } = useAdminNotifications();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/connexion');
    addNotification({
      type: 'info',
      message: 'Déconnexion réussie'
    });
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Vue d\'ensemble'
    },
    {
      path: '/admin/users',
      icon: Users,
      label: 'Utilisateurs',
      description: 'Gestion des comptes'
    },
    {
      path: '/admin/exams',
      icon: BookOpen,
      label: 'Examens',
      description: 'Modération des examens'
    },
    {
      path: '/admin/reports',
      icon: Flag,
      label: 'Signalements',
      description: 'Modération et sécurité'
    },
    {
      path: '/admin/analytics',
      icon: BarChart3,
      label: 'Analytics',
      description: 'Statistiques détaillées'
    },
    {
      path: '/admin/notifications',
      icon: Bell,
      label: 'Notifications',
      description: 'Communication',
      badge: unreadCount
    },
    {
      path: '/admin/settings',
      icon: Settings,
      label: 'Paramètres',
      description: 'Configuration'
    },
    {
      path: '/admin/logs',
      icon: FileText,
      label: 'Logs',
      description: 'Audit et système'
    },
    {
      path: '/admin/appeals',
      icon: AlertCircle,
      label: 'Demandes',
      description: 'Demandes de réactivation'
    }
  ];

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar pour mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl">
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={20} className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>
            <nav className="p-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
                      isActivePath(item.path)
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon size={20} />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Menu mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu size={20} className="text-gray-700 dark:text-gray-300" />
            </button>

            {/* Logo et titre */}
            <div className="flex items-center gap-4">
              <button 
                className="cursor-pointer active:scale-95 hover:scale-105 transition-transform rounded-lg flex items-center justify-center"
                onClick={() => navigate('/')}
              >
                <img src={logoAnciensExamens} alt="Logo UIDT" className="w-12 h-12" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Panneau d'administration</p>
              </div>
            </div>

            {/* Actions header */}
            <div className="flex items-center gap-4">
              {/* Bouton thème */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                title={isDark ? 'Mode clair' : 'Mode sombre'}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                  onClick={() => navigate('/admin/notifications')}
                >
                  <Bell size={20} className="text-gray-700 dark:text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </div>

              {/* Profil utilisateur */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Administrateur</div>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 shadow-sm border-r dark:border-gray-700 h-screen sticky top-0 overflow-y-auto">
          <div className="p-4">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActivePath(item.path)
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon size={20} />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
