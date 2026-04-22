import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Download, BookOpen, Calendar, Filter, ArrowUp, ArrowDown, Activity, Eye } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function AnalyticsPanel() {
  const { addNotification } = useAdmin();
  const [period, setPeriod] = useState('7d');
  const [chartType, setChartType] = useState('users');
  const [loading, setLoading] = useState(false);
  
  // Données simulées pour les graphiques
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [
      { date: '2024-01-01', users: 1200, newUsers: 45, activeUsers: 890 },
      { date: '2024-01-02', users: 1250, newUsers: 50, activeUsers: 920 },
      { date: '2024-01-03', users: 1300, newUsers: 50, activeUsers: 950 },
      { date: '2024-01-04', users: 1380, newUsers: 80, activeUsers: 1020 },
      { date: '2024-01-05', users: 1450, newUsers: 70, activeUsers: 1080 },
      { date: '2024-01-06', users: 1520, newUsers: 70, activeUsers: 1150 },
      { date: '2024-01-07', users: 1600, newUsers: 80, activeUsers: 1200 }
    ],
    examStats: [
      { date: '2024-01-01', totalExams: 450, newExams: 12, downloads: 280, approvedExams: 420 },
      { date: '2024-01-02', totalExams: 462, newExams: 12, downloads: 320, approvedExams: 432 },
      { date: '2024-01-03', totalExams: 475, newExams: 13, downloads: 350, approvedExams: 445 },
      { date: '2024-01-04', totalExams: 490, newExams: 15, downloads: 380, approvedExams: 458 },
      { date: '2024-01-05', totalExams: 508, newExams: 18, downloads: 420, approvedExams: 475 },
      { date: '2024-01-06', totalExams: 525, newExams: 17, downloads: 450, approvedExams: 490 },
      { date: '2024-01-07', totalExams: 545, newExams: 20, downloads: 480, approvedExams: 508 }
    ],
    ufrStats: [
      { ufr: 'UFR Sciences et Technologies', users: 450, exams: 180, downloads: 1200 },
      { ufr: 'UFR Sciences Économiques et de Gestion', users: 380, exams: 150, downloads: 980 },
      { ufr: 'UFR Lettres, Arts et Communication', users: 320, exams: 120, downloads: 750 },
      { ufr: 'UFR Sciences Juridiques et Politiques', users: 280, exams: 95, downloads: 620 }
    ],
    topExams: [
      { title: 'Mathématiques Analyse I', downloads: 450, rating: 4.8, ufr: 'UFR Sciences et Technologies' },
      { title: 'Économie Politique', downloads: 380, rating: 4.6, ufr: 'UFR Sciences Économiques et de Gestion' },
      { title: 'Droit Constitutionnel', downloads: 320, rating: 4.7, ufr: 'UFR Sciences Juridiques et Politiques' },
      { title: 'Littérature Française', downloads: 280, rating: 4.5, ufr: 'UFR Lettres, Arts et Communication' },
      { title: 'Physique Générale', downloads: 260, rating: 4.9, ufr: 'UFR Sciences et Technologies' }
    ]
  });

  const periods = [
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '90 jours' },
    { value: '1y', label: '1 an' }
  ];

  const chartTypes = [
    { value: 'users', label: 'Utilisateurs', icon: Users },
    { value: 'exams', label: 'Examens', icon: BookOpen },
    { value: 'downloads', label: 'Téléchargements', icon: Download },
    { value: 'activity', label: 'Activité', icon: Activity }
  ];

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return 0;
    const growth = ((current - previous) / previous) * 100;
    return growth.toFixed(1);
  };

  const getChartData = () => {
    switch (chartType) {
      case 'users':
        return analyticsData.userGrowth.map(d => ({
          date: d.date,
          value: d.newUsers,
          label: 'Nouveaux utilisateurs'
        }));
      case 'exams':
        return analyticsData.examStats.map(d => ({
          date: d.date,
          value: d.newExams,
          label: 'Nouveaux examens'
        }));
      case 'downloads':
        return analyticsData.examStats.map(d => ({
          date: d.date,
          value: d.downloads,
          label: 'Téléchargements'
        }));
      case 'activity':
        return analyticsData.userGrowth.map(d => ({
          date: d.date,
          value: d.activeUsers,
          label: 'Utilisateurs actifs'
        }));
      default:
        return [];
    }
  };

  const exportReport = async (format) => {
    setLoading(true);
    try {
      // Simuler l'export
      await new Promise(resolve => setTimeout(resolve, 2000));
      addNotification({
        type: 'success',
        message: `Rapport exporté en ${format.toUpperCase()}`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors de l\'export'
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Statistiques détaillées de la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periods.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <button
            onClick={() => exportReport('csv')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={20} />
            {loading ? 'Export...' : 'Exporter'}
          </button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <ArrowUp size={16} />
              {calculateGrowth(1600, 1200)}%
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">1,600</h3>
            <p className="text-gray-600 text-sm">Utilisateurs totaux</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="text-green-600" size={24} />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <ArrowUp size={16} />
              {calculateGrowth(545, 450)}%
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">545</h3>
            <p className="text-gray-600 text-sm">Examens partagés</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Download className="text-purple-600" size={24} />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <ArrowUp size={16} />
              {calculateGrowth(480, 280)}%
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">4,800</h3>
            <p className="text-gray-600 text-sm">Téléchargements</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="text-orange-600" size={24} />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
              <ArrowUp size={16} />
              {calculateGrowth(1200, 890)}%
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">1,200</h3>
            <p className="text-gray-600 text-sm">Utilisateurs actifs</p>
          </div>
        </div>
      </div>

      {/* Graphique principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Évolution des {chartTypes.find(t => t.value === chartType)?.label.toLowerCase()}</h2>
          <div className="flex items-center gap-2">
            {chartTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setChartType(type.value)}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    chartType === type.value
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Graphique simplifié */}
        <div className="h-64 flex items-end justify-between gap-2">
          {chartData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 hover:to-blue-500 transition-colors cursor-pointer"
                style={{ height: `${(data.value / maxValue) * 200}px` }}
                title={`${data.label}: ${data.value}`}
              ></div>
              <span className="text-xs text-gray-600">
                {new Date(data.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques par UFR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques par UFR</h2>
          <div className="space-y-4">
            {analyticsData.ufrStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{stat.ufr}</div>
                  <div className="text-sm text-gray-500">
                    {stat.users} utilisateurs, {stat.exams} examens
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{stat.downloads}</div>
                  <div className="text-sm text-gray-500">téléchargements</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top examens */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Examens les plus populaires</h2>
          <div className="space-y-4">
            {analyticsData.topExams.map((exam, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 max-w-xs truncate">
                      {exam.title}
                    </div>
                    <div className="text-sm text-gray-500">{exam.ufr}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Eye size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{exam.downloads}</span>
                  </div>
                  <div className="text-sm text-gray-500">Note: {exam.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau de performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance système</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Temps de réponse moyen</span>
              <span className="font-medium text-green-600">245ms</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Taux de disponibilité</span>
              <span className="font-medium text-green-600">99.9%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Satisfaction utilisateurs</span>
              <span className="font-medium text-green-600">4.8/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
