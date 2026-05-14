import { X, User, Clock } from 'lucide-react';
import { formatTimestamp, getLevelBadge } from './helpers';

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function LogDetailsModal({ log, onClose }) {
  if (!log) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center gap-3">
            {getLevelBadge(log.level)}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Détails du log</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Action">
              <p className="mt-1 text-sm font-mono bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded text-gray-900 dark:text-white break-all">
                {log.action}
              </p>
            </Field>
            <Field label="Niveau">
              <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize px-3 py-2">
                {log.level}
              </p>
            </Field>
            <Field label="Utilisateur">
              <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center gap-2 px-3 py-2">
                <User size={14} className="text-gray-400" />
                {log.user}
              </p>
            </Field>
            <Field label="Date">
              <p className="mt-1 text-sm text-gray-900 dark:text-white flex items-center gap-2 px-3 py-2">
                <Clock size={14} className="text-gray-400" />
                {formatTimestamp(log.timestamp)}
              </p>
            </Field>
            <Field label="Adresse IP">
              <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white px-3 py-2">
                {log.ip || 'N/A'}
              </p>
            </Field>
            <Field label="ID Utilisateur">
              <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white break-all px-3 py-2">
                {log.userId || 'N/A'}
              </p>
            </Field>
          </div>

          <Field label="Message">
            <p className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              {log.message}
            </p>
          </Field>

          {log.userAgent && (
            <Field label="User Agent">
              <p className="mt-1 text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg break-all">
                {log.userAgent}
              </p>
            </Field>
          )}

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <Field label="Metadata">
              <pre className="mt-1 text-xs font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto">
{JSON.stringify(log.metadata, null, 2)}
              </pre>
            </Field>
          )}

          <Field label="ID du log">
            <p className="mt-1 text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
              {log._id}
            </p>
          </Field>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
