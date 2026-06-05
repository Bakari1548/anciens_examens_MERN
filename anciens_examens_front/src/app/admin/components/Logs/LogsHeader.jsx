import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LogsHeader({ onExport, onCleanup }) {
  const [cleaning, setCleaning] = useState(false);

  const handleCleanupClick = async () => {
    const input = window.prompt(
      'Supprimer les logs plus anciens que combien de jours ?\n(Par défaut : 30)',
      '30'
    );
    if (input === null) return; // annulé

    const days = parseInt(input, 10);
    if (isNaN(days) || days < 1) {
      toast.error('Veuillez entrer un nombre de jours valide');
      return;
    }

    if (!window.confirm(`Confirmer la suppression de tous les logs de plus de ${days} jours ?`)) {
      return;
    }

    try {
      setCleaning(true);
      const result = await onCleanup(days);
      toast.success(`${result?.deleted ?? 0} log(s) supprimé(s) avec succès`);
    } catch (error) {
      toast.error('Erreur lors du nettoyage des logs');
    } finally {
      setCleaning(false);
    }
  };

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
          onClick={handleCleanupClick}
          disabled={cleaning}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={20} />
          {cleaning ? 'Nettoyage...' : 'Nettoyer'}
        </button>
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
