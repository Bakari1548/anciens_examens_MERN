import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Download, BookOpen, Calendar, Filter, ArrowUp, ArrowDown, Activity, Eye } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

export default function AnalyticsPanel() {
  const { addNotification } = useAdmin();
  const { isDark } = useTheme();
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
      if (format === 'csv') {
        const headers = ['Date', 'Utilisateurs', 'Nouveaux utilisateurs', 'Utilisateurs actifs', 'Examens', 'Nouveaux examens', 'Téléchargements'];
        const rows = analyticsData.userGrowth.map((user, index) => {
          const exam = analyticsData.examStats[index] || {};
          return [
            user.date,
            user.users,
            user.newUsers,
            user.activeUsers,
            exam.totalExams || 0,
            exam.newExams || 0,
            exam.downloads || 0
          ];
        });

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addNotification({
          type: 'success',
          message: 'Rapport exporté en CSV'
        });
      } else if (format === 'pdf') {
        const headers = ['Date', 'Utilisateurs', 'Nouveaux utilisateurs', 'Utilisateurs actifs', 'Examens', 'Nouveaux examens', 'Téléchargements'];
        const rows = analyticsData.userGrowth.map((user, index) => {
          const exam = analyticsData.examStats[index] || {};
          return [
            user.date,
            user.users,
            user.newUsers,
            user.activeUsers,
            exam.totalExams || 0,
            exam.newExams || 0,
            exam.downloads || 0
          ];
        });

        const tableContent = `
          <html>
            <head>
              <title>Export Analytics</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #4CAF50; color: white; }
                tr:nth-child(even) { background-color: #f2f2f2; }
              </style>
            </head>
            <body>
              <h1>Rapport Analytics</h1>
              <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
              <table>
                <thead>
                  <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(tableContent);
        printWindow.document.close();
        printWindow.print();

        addNotification({
          type: 'success',
          message: 'Rapport exporté en PDF'
        });
      }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Statistiques détaillées de la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periods.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <div className="relative">
            <button
              onClick={() => document.getElementById('export-dropdown-analytics').classList.toggle('hidden')}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download size={20} />
              {loading ? 'Export...' : 'Exporter'}
            </button>
            <div id="export-dropdown-analytics" className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                <button
                  onClick={() => exportReport('csv')}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Exporter en CSV
                </button>
                <button
                  onClick={() => exportReport('pdf')}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Exporter en PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
              <ArrowUp size={16} />
              {calculateGrowth(1600, 1200)}%
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1,600</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Utilisateurs totaux</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <BookOpen className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
              <ArrowUp size={16} />
              {calculateGrowth(545, 450)}%
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">545</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Examens partagés</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Download className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
              <ArrowUp size={16} />
              {calculateGrowth(480, 280)}%
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">4,800</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Téléchargements</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Activity className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
              <ArrowUp size={16} />
              {calculateGrowth(1200, 890)}%
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1,200</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Utilisateurs actifs</p>
          </div>
        </div>
      </div>

      {/* Graphique principal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Évolution des {chartTypes.find(t => t.value === chartType)?.label.toLowerCase()}</h2>
          <div className="flex items-center gap-2">
            {chartTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setChartType(type.value)}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    chartType === type.value
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
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
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {new Date(data.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques par UFR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistiques par UFR</h2>
          <div className="space-y-4">
            {analyticsData.ufrStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{stat.ufr}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.users} utilisateurs, {stat.exams} examens
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">{stat.downloads}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">téléchargements</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top examens */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Examens les plus populaires</h2>
          <div className="space-y-4">
            {analyticsData.topExams.map((exam, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white max-w-xs truncate">
                      {exam.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{exam.ufr}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Eye size={16} className="text-gray-400 dark:text-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{exam.downloads}</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Note: {exam.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau de performance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance système</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Temps de réponse moyen</span>
              <span className="font-medium text-green-600 dark:text-green-400">245ms</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Taux de disponibilité</span>
              <span className="font-medium text-green-600 dark:text-green-400">99.9%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Satisfaction utilisateurs</span>
              <span className="font-medium text-green-600 dark:text-green-400">4.8/5</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
