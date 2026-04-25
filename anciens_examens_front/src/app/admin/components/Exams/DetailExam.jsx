import { FileText, Calendar, User, Download, Clock, CheckCircle, XCircle, Eye, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function DetailExam({ exam, onClose }) {
  const { isDark } = useTheme();

  if (!exam) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Détails de l'examen</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{exam._id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{exam.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{exam.matiere} - {exam.year}</p>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            {exam.status === 'pending' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                <Clock size={14} />
                En attente
              </span>
            )}
            {exam.status === 'approved' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                <CheckCircle size={14} />
                Approuvé
              </span>
            )}
            {exam.status === 'rejected' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
                <XCircle size={14} />
                Rejeté
              </span>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="text-gray-500 dark:text-gray-400" size={18} />
                <span className="text-sm text-gray-500 dark:text-gray-400">Auteur</span>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">
                {exam.author?.firstName} {exam.author?.lastName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{exam.author?.email}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-gray-500 dark:text-gray-400" size={18} />
                <span className="text-sm text-gray-500 dark:text-gray-400">Date de création</span>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">
                {new Date(exam.createdAt).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(exam.createdAt).toLocaleTimeString('fr-FR')}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-gray-500 dark:text-gray-400" size={18} />
                <span className="text-sm text-gray-500 dark:text-gray-400">UFR</span>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{exam.ufr}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="text-gray-500 dark:text-gray-400" size={18} />
                <span className="text-sm text-gray-500 dark:text-gray-400">Filière</span>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{exam.filiere}</p>
            </div>
          </div>

          {/* Description */}
          {exam.description && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h4>
              <p className="text-gray-900 dark:text-white">{exam.description}</p>
            </div>
          )}

          {/* File Info */}
          {exam.fileUrl && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fichier</h4>
                  <p className="text-gray-900 dark:text-white text-sm">{exam.fileUrl.split('/').pop()}</p>
                </div>
                <a
                  href={exam.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download size={18} />
                </a>
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {exam.status === 'rejected' && exam.rejectionReason && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Raison du rejet</h4>
              <p className="text-red-700 dark:text-red-400">{exam.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
          {exam.fileUrl && (
            <a
              href={exam.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Télécharger
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
