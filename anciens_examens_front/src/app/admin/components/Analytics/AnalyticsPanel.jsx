import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Download, BookOpen, Calendar, Filter, ArrowUp, ArrowDown, Activity, Eye, Loader2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { analyticsApi } from '../../services/analytics.api';

export default function AnalyticsPanel() {
  const { addNotification, stats, fetchStats, loading } = useAdmin();
  const { isDark } = useTheme();
  const [period, setPeriod] = useState('7d');
  const [chartType, setChartType] = useState('users');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [chartTooltip, setChartTooltip] = useState(null);

  // Charger les stats au montage du composant
  useEffect(() => {
    fetchStats();
  }, []);

  // Charger toutes les données depuis le backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const data = await analyticsApi.getAnalytics(period);
        setAnalyticsData({
          userGrowth: data.userGrowth || [],
          examStats: data.examStats || [],
          ufrStats: data.ufrStats || [],
          topExams: (data.topExams || []).map(e => ({
            title: e.title,
            views: e.viewsCount,
            rating: e.averageRating || null,
            ufr: e.ufr
          }))
        });
      } catch (err) {
        console.error('Erreur chargement analytics:', err);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
    setChartTooltip(null);
  }, [period]);

  // Données pour les graphiques
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    examStats: [],
    ufrStats: [],
    topExams: []
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
    { value: 'downloads', label: 'Téléchargements', icon: Download }
  ];

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return 0;
    const growth = ((current - previous) / previous) * 100;
    return growth.toFixed(1);
  };

  const formatChartDate = (dateStr, tooltip = false) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-').map(Number);
    if (parts.length === 2) {
      const d = new Date(parts[0], parts[1] - 1, 1);
      return tooltip
        ? d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        : d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    }
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return tooltip
      ? d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
      : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
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
          value: d.downloads ?? 0,
          label: 'Téléchargements'
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
  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value), 1) : 1;

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
            {analyticsData.userGrowth.length >= 2 && (() => {
              const half = Math.floor(analyticsData.userGrowth.length / 2);
              const prev = analyticsData.userGrowth.slice(0, half).reduce((s, d) => s + (d.newUsers || 0), 0);
              const curr = analyticsData.userGrowth.slice(half).reduce((s, d) => s + (d.newUsers || 0), 0);
              if (prev === 0) return null;
              const pct = ((curr - prev) / prev * 100).toFixed(1);
              const isUp = parseFloat(pct) >= 0;
              return (
                <div className={`flex items-center gap-1 text-sm font-medium ${isUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {isUp ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  {Math.abs(pct)}%
                </div>
              );
            })()}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Utilisateurs totaux</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <BookOpen className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalExams}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Examens partagés</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Download className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Téléchargements</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Eye className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Vues totales</p>
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

        {/* SVG Area Chart */}
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
            Aucune donnée pour cette période
          </div>
        ) : (() => {
          const gradColors = { users: '#3b82f6', exams: '#10b981', downloads: '#8b5cf6', activity: '#f59e0b' };
          const color = gradColors[chartType] || '#3b82f6';
          const W = 560, H = 160;
          const PAD = { top: 15, bottom: 5, left: 8, right: 8 };
          const cW = W - PAD.left - PAD.right;
          const cH = H - PAD.top - PAD.bottom;
          const pts = chartData.map((d, i) => ({
            x: PAD.left + (chartData.length === 1 ? cW / 2 : (i / (chartData.length - 1)) * cW),
            y: PAD.top + (maxValue === 0 ? cH : (1 - d.value / maxValue) * cH),
            ...d
          }));
          const linePts = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
          const areaPts = [
            `${pts[0].x.toFixed(1)},${H}`,
            ...pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`),
            `${pts[pts.length - 1].x.toFixed(1)},${H}`
          ].join(' ');
          return (
            <div>
              <div className="flex gap-2">
                <div className="flex flex-col justify-between text-xs text-gray-400 dark:text-gray-500 text-right py-1 w-10 flex-shrink-0" style={{ height: '160px' }}>
                  <span>{maxValue.toLocaleString()}</span>
                  <span>{Math.round(maxValue * 0.5).toLocaleString()}</span>
                  <span>0</span>
                </div>
                <div className="flex-1" style={{ height: '160px' }}>
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    {[0.25, 0.5, 0.75].map(pct => (
                      <line key={pct}
                        x1={PAD.left} y1={(PAD.top + (1 - pct) * cH).toFixed(1)}
                        x2={W - PAD.right} y2={(PAD.top + (1 - pct) * cH).toFixed(1)}
                        stroke={isDark ? '#374151' : '#f3f4f6'} strokeWidth="1" strokeDasharray="4 3"
                      />
                    ))}
                    <polygon points={areaPts} fill="url(#areaGrad)" />
                    <polyline points={linePts} fill="none" stroke={color} strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map((p, i) => (
                      <g key={i}
                        onMouseEnter={() => setChartTooltip(i)}
                        onMouseLeave={() => setChartTooltip(null)}
                        onClick={() => setChartTooltip(chartTooltip === i ? null : i)}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="12" fill="transparent" />
                        <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)}
                          r={chartTooltip === i ? '6' : '4'}
                          fill="white" stroke={color} strokeWidth="2"
                        />
                        {chartTooltip === i && (() => {
                          const tipW = 130, tipH = 52;
                          const tipX = p.x + tipW + 14 > W ? p.x - tipW - 10 : p.x + 10;
                          const tipY = Math.max(2, Math.min(p.y - tipH / 2, H - tipH - 2));
                          return (
                            <g style={{ pointerEvents: 'none' }}>
                              <rect x={tipX - 4} y={tipY - 4} width={tipW + 8} height={tipH + 8}
                                rx="6" ry="6"
                                fill={isDark ? '#111827' : 'white'}
                                stroke={color} strokeWidth="1.5"
                                style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.18))' }}
                              />
                              <text x={tipX + 4} y={tipY + 13} fontSize="9"
                                fill={isDark ? '#9ca3af' : '#6b7280'}>
                                {formatChartDate(p.date, true)}
                              </text>
                              <text x={tipX + 4} y={tipY + 30} fontSize="14"
                                fontWeight="bold" fill={color}>
                                {p.value.toLocaleString()}
                              </text>
                              <text x={tipX + 4} y={tipY + 44} fontSize="9"
                                fill={isDark ? '#9ca3af' : '#6b7280'}>
                                {p.label}
                              </text>
                            </g>
                          );
                        })()}
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <div className="w-10 flex-shrink-0" />
                <div className="flex-1 flex justify-between">
                  {pts.map((p, i) => (
                    <span key={i} className="text-xs text-gray-400 dark:text-gray-500 text-center">
                      {formatChartDate(p.date)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Statistiques par UFR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Statistiques par UFR</h2>
            {analyticsLoading && <Loader2 size={16} className="animate-spin text-blue-500" />}
          </div>
          <div className="space-y-4">
            {analyticsData.ufrStats.length === 0 && !analyticsLoading ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Aucune donnée disponible</p>
            ) : (() => {
              const palette = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
              const maxU = Math.max(...analyticsData.ufrStats.map(s => s.users), 1);
              return analyticsData.ufrStats.map((stat, index) => {
                const pct = Math.round((stat.users / maxU) * 100);
                const color = palette[index % palette.length];
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{stat.ufr}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        <span className="flex items-center gap-1"><Users size={10} /> {stat.users}</span>
                        <span className="flex items-center gap-1"><BookOpen size={10} /> {stat.exams}</span>
                        <span className="flex items-center gap-1"><Download size={10} /> {stat.downloads}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div className="h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.85 }} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Top examens */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Examens les plus populaires</h2>
            {analyticsLoading && <Loader2 size={16} className="animate-spin text-blue-500" />}
          </div>
          <div className="space-y-3">
            {analyticsData.topExams.length === 0 && !analyticsLoading ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Aucun examen disponible</p>
            ) : (() => {
              const medals = [
                { bg: 'from-yellow-400 to-amber-500', ring: 'ring-yellow-300 dark:ring-yellow-600' },
                { bg: 'from-slate-300 to-slate-400', ring: 'ring-slate-200 dark:ring-slate-500' },
                { bg: 'from-amber-600 to-orange-600', ring: 'ring-amber-300 dark:ring-amber-600' },
              ];
              const defMedal = { bg: 'from-blue-400 to-indigo-500', ring: 'ring-blue-200 dark:ring-blue-600' };
              const maxViews = Math.max(...analyticsData.topExams.map(e => e.views ?? 0), 1);
              return analyticsData.topExams.map((exam, index) => {
                const medal = medals[index] || defMedal;
                const pct = Math.round(((exam.views ?? 0) / maxViews) * 100);
                return (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className={`w-8 h-8 flex-shrink-0 bg-gradient-to-br ${medal.bg} ring-2 ${medal.ring} rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{exam.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{exam.ufr}</p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <Eye size={12} className="text-blue-500" />
                            <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">{(exam.views ?? 0).toLocaleString()}</span>
                          </div>
                          {exam.rating != null && (
                            <span className="text-xs text-gray-400">★ {exam.rating.toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
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
