import { FileText, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

function StatCard({ icon: Icon, iconColor, value, label }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <Icon className={iconColor} size={24} />
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{label}</p>
    </div>
  );
}

export default function LogsStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        icon={FileText}
        iconColor="text-blue-600 dark:text-blue-400"
        value={stats.total}
        label="Total logs"
      />
      <StatCard
        icon={CheckCircle}
        iconColor="text-green-600 dark:text-green-400"
        value={stats.info}
        label="Info"
      />
      <StatCard
        icon={AlertTriangle}
        iconColor="text-yellow-600 dark:text-yellow-400"
        value={stats.warning}
        label="Warnings"
      />
      <StatCard
        icon={XCircle}
        iconColor="text-red-600 dark:text-red-400"
        value={stats.error}
        label="Erreurs"
      />
    </div>
  );
}
