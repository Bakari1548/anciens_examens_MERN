import { Download } from 'lucide-react';

export default function LogsHeader({ onExport }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Logs système</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Audit et journalisation des événements
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Download size={20} />
          Exporter
        </button>
      </div>
    </div>
  );
}
