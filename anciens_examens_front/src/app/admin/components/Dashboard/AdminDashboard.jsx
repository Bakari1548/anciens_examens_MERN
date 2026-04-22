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
import { useAdminStats } from '../../hooks/useAdmin';
import { useAdmin } from '../../context/AdminContext';

export default function AdminDashboard() {
  const { stats, fetchStats, userGrowthRate, examApprovalRate, loading } = useAdminStats();
  const { fetchUsers, fetchExams, fetchReports } = useAdmin();
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchUsers({ limit: 5 });
    fetchExams({ limit: 5 });
    fetchReports();
    
    // Simuler les données d'activité récente
    setRecentActivity([
      { id: 1, type: 'user', action: 'Nouveau utilisateur inscrit', user: 'Aminata Diallo', time: 'Il y a 5 min', icon: Users, color: 'text-green-600' },
      { id: 2, type: 'exam', action: 'Nouvel examen soumis', user: 'Ibrahima Ba', time: 'Il y a 15 min', icon: BookOpen, color: 'text-blue-600' },
      { id: 3, type: 'report', action: 'Signalement créé', user: 'Fatou Camara', time: 'Il y a 30 min', icon: AlertTriangle, color: 'text-red-600' },
      { id: 4, type: 'download', action: 'Examen téléchargé', user: 'Moussa Ndiaye', time: 'Il y a 1h', icon: Download, color: 'text-purple-600' },
      { id: 5, type: 'user', action: 'Utilisateur banni', user: 'Modérateur', time: 'Il y a 2h', icon: Shield, color: 'text-orange-600' }
    ]);

    // Simuler les données du graphique
    setChartData([
      { day: 'Lun', users: 120, exams: 45, downloads: 280 },
      { day: 'Mar', users: 150, exams: 52, downloads: 320 },
      { day: 'Mer', users: 180, exams: 38, downloads: 350 },
      { day: 'Jeu', users: 140, exams: 65, downloads: 290 },
      { day: 'Ven', users: 200, exams: 48, downloads: 410 },
      { day: 'Sam', users: 90, exams: 25, downloads: 180 },
      { day: 'Dim', users: 60, exams: 15, downloads: 120 }
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'increase' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  {stat.change}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</h3>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions rapides et activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions rapides */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <a
                    key={index}
                    href={action.link}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                      <Icon className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${activity.color.replace('text', 'bg')} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={activity.color} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user} - {activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Graphique d'activité */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Activité cette semaine</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Utilisateurs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Examens</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Téléchargements</span>
            </div>
          </div>
        </div>
        
        {/* Graphique simplifié */}
        <div className="h-64 flex items-end justify-between gap-2">
          {chartData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col gap-1">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(data.users / 200) * 100}px` }}
                ></div>
                <div 
                  className="w-full bg-green-500"
                  style={{ height: `${(data.exams / 200) * 100}px` }}
                ></div>
                <div 
                  className="w-full bg-purple-500 rounded-b"
                  style={{ height: `${(data.downloads / 450) * 100}px` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600">{data.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques additionnelles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Taux de croissance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Utilisateurs actifs</span>
              <span className="font-medium text-green-600">{userGrowthRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Examens approuvés</span>
              <span className="font-medium text-green-600">{examApprovalRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance système</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Temps de réponse</span>
              <span className="font-medium text-green-600">245ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Uptime</span>
              <span className="font-medium text-green-600">99.9%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stockage</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Espace utilisé</span>
              <span className="font-medium text-orange-600">2.4GB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total disponible</span>
              <span className="font-medium text-gray-600">10GB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
