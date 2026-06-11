import { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Download, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Activity,
  Eye,
  Clock,
  ArrowUp,
  ArrowDown,
  Shield
} from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdmin.stats';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

// Formater les bytes en unité lisible (KB, MB, GB...)
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

// Composant carte de stockage réutilisable
const StorageCard = ({ title, usedBytes, totalBytes, colorClass = 'bg-orange-500' }) => {
  const percentage = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Espace utilisé</span>
          <span className="font-medium text-orange-600 dark:text-orange-400">
            {formatBytes(usedBytes)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Total disponible</span>
          <span className="font-medium text-gray-600 dark:text-gray-400">
            {formatBytes(totalBytes)}
          </span>
        </div>
        {totalBytes > 0 && (
          <div className="pt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`${colorClass} h-2 rounded-full transition-all`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {percentage.toFixed(1)}% utilisé
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { isDark } = useTheme();
  const { stats, fetchStats, userGrowthRate, examApprovalRate, loading } = useAdminStats();
  const { fetchUsers, fetchExams, fetchReports } = useAdmin();
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchUsers({ page: 1, limit: 5 });
    fetchExams({ page: 1, limit: 5 });
    fetchReports({ page: 1, limit: 5 });
    
    // Simuler les données d'activité récente
    setRecentActivity([
      { id: 1, type: 'user', action: 'Nouveau utilisateur inscrit', user: 'Aminata Diallo', time: 'Il y a 5 min', icon: Users, color: 'text-green-600' },
      { id: 2, type: 'exam', action: 'Nouvel examen soumis', user: 'Ibrahima Ba', time: 'Il y a 15 min', icon: BookOpen, color: 'text-blue-600' },
      { id: 3, type: 'report', action: 'Signalement créé', user: 'Fatou Camara', time: 'Il y a 30 min', icon: AlertTriangle, color: 'text-red-600' },
      { id: 4, type: 'download', action: 'Examen téléchargé', user: 'Moussa Ndiaye', time: 'Il y a 1h', icon: Download, color: 'text-purple-600' },
      { id: 5, type: 'user', action: 'Utilisateur banni', user: 'Modérateur', time: 'Il y a 2h', icon: Shield, color: 'text-orange-600' }
    ]);

  }, []);

  const statCards = [
    {
      title: 'Utilisateurs totaux',
      value: stats.totalUsers,
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Examens partagés',
      value: stats.totalExams,
      change: '+8%',
      changeType: 'increase',
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Téléchargements',
      value: stats.totalDownloads,
      change: '+15%',
      changeType: 'increase',
      icon: Download,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Utilisateurs actifs',
      value: stats.activeUsers,
      change: '-3%',
      changeType: 'decrease',
      icon: Activity,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Examens en attente',
      value: stats.pendingExams,
      change: '-25%',
      changeType: 'decrease',
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Signalements',
      value: stats.reports,
      change: '+5%',
      changeType: 'increase',
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  const quickActions = [
    { title: 'Valider les examens', description: `${stats.pendingExams} examens en attente`, icon: CheckCircle, color: 'bg-green-500', link: '/admin/exams?status=pending' },
    { title: 'Gérer les signalements', description: `${stats.reports} signalements actifs`, icon: AlertTriangle, color: 'bg-red-500', link: '/admin/reports' },
    { title: 'Voir les utilisateurs', description: `${stats.totalUsers} utilisateurs totaux`, icon: Users, color: 'bg-blue-500', link: '/admin/users' },
    { title: 'Analytics détaillés', description: 'Statistiques complètes', icon: TrendingUp, color: 'bg-purple-500', link: '/admin/analytics' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.changeType === 'increase' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  {stat.change}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions rapides et activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions rapides */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <a
                    key={index}
                    href={action.link}
                    className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                      <Icon className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{action.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activité récente</h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${activity.color.replace('text', 'bg')} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={activity.color} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.user} - {activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Répartition de la plateforme */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Répartition de la plateforme</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

          {/* Barres de progression des examens */}
          <div className="md:col-span-2 space-y-5">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Statut des examens</h3>
            {[
              { label: 'Approuvés', value: stats.approvedExams || 0, color: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' },
              { label: 'En attente', value: stats.pendingExams || 0, color: 'bg-yellow-400', textColor: 'text-yellow-600 dark:text-yellow-400' },
              { label: 'Rejetés', value: Math.max(0, (stats.totalExams || 0) - (stats.approvedExams || 0) - (stats.pendingExams || 0)), color: 'bg-red-400', textColor: 'text-red-600 dark:text-red-400' },
            ].map(({ label, value, color, textColor }) => {
              const pct = (stats.totalExams || 0) > 0 ? Math.round((value / stats.totalExams) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                    <span className={`font-semibold ${textColor}`}>{value.toLocaleString()} <span className="font-normal text-gray-400">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                    <div className={`${color} h-3 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}

            <div className="pt-3 grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Eye className="text-blue-500" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Vues totales</p>
                  <p className="font-bold text-gray-900 dark:text-white">{(stats.totalViews || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Download className="text-purple-500" size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Téléchargements</p>
                  <p className="font-bold text-gray-900 dark:text-white">{(stats.totalDownloads || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Donut CSS utilisateurs actifs */}
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Utilisateurs actifs</h3>
            {(() => {
              const pct = (stats.totalUsers || 0) > 0 ? Math.round(((stats.activeUsers || 0) / stats.totalUsers) * 100) : 0;
              return (
                <div className="relative w-36 h-36">
                  <div
                    className="w-36 h-36 rounded-full"
                    style={{
                      background: `conic-gradient(#3b82f6 ${pct * 3.6}deg, ${isDark ? '#374151' : '#5a5a5a'} ${pct * 3.6}deg)`
                    }}
                  />
                  <div className={`absolute inset-[14px] rounded-full flex flex-col items-center justify-center bg-gray-800`}>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{pct}%</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">actifs</span>
                  </div>
                </div>
              );
            })()}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{(stats.activeUsers || 0).toLocaleString()} / {(stats.totalUsers || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">utilisateurs actifs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques additionnelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Taux de croissance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Utilisateurs actifs</span>
              <span className="font-medium text-green-600 dark:text-green-400">{userGrowthRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Examens approuvés</span>
              <span className="font-medium text-green-600 dark:text-green-400">{examApprovalRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance système</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Temps de réponse</span>
              <span className="font-medium text-green-600 dark:text-green-400">245ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Uptime</span>
              <span className="font-medium text-green-600 dark:text-green-400">99.9%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stockage détaillé : MongoDB + Cloudinary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StorageCard
          title="Base de données (MongoDB)"
          usedBytes={stats.storage?.database?.usedBytes || 0}
          totalBytes={stats.storage?.database?.totalBytes || 0}
          colorClass="bg-blue-500"
        />
        <StorageCard
          title="Fichiers (Cloudinary)"
          usedBytes={stats.storage?.cloudinary?.usedBytes || 0}
          totalBytes={stats.storage?.cloudinary?.totalBytes || 0}
          colorClass="bg-orange-500"
        />
      </div>
    </div>
  );
}
