import { FileText, Calendar, User, Download, Clock, CheckCircle, XCircle, Eye, X, Edit, Maximize2, ExternalLink, BookOpen } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import EditExam from './EditExam';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DetailExam({ exam, onClose }) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!exam) return null;

  const handleViewDocument = (file) => {
    setShowDocumentModal(file);
    setIsFullscreen(false);
  };

  const renderDocumentContent = (file) => {
    if (!file) return null;

    const isPdf = file.mimeType === 'application/pdf';
    const isImage = file.mimeType?.startsWith('image/');

    if (isPdf) {
      return (
        <iframe
          src={file.url}
          className="w-full h-full"
          title={file.originalName || `Fichier ${file.index}`}
          frameBorder="0"
        />
      );
    }

    if (isImage) {
      return (
        <img
          src={file.url}
          alt={file.originalName || `Fichier ${file.index}`}
          className="max-w-full max-h-full object-contain"
        />
      );
    }

    // Pour les autres types de fichiers
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <FileText size={64} className="text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Ce type de fichier ne peut pas être visualisé directement
        </p>
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Download size={16} />
          Télécharger
        </a>
      </div>
    );
  };

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
            <p className="text-gray-600 dark:text-gray-400">{exam.matiere} - {exam.anneeExamen}</p>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                <BookOpen className="text-gray-500 dark:text-gray-400" size={18} />
                <span className="text-sm text-gray-500 dark:text-gray-400">Filière</span>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{exam.filiere}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-gray-500 dark:text-gray-400" size={18} />
                <span className="text-sm text-gray-500 dark:text-gray-400">Niveau</span>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{exam.niveau}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-gray-500 dark:text-gray-400" size={18} />
                <span className="text-sm text-gray-500 dark:text-gray-400">Semestre</span>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{exam.semestre}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-gray-500 dark:text-gray-400" size={18} />
                <span className="text-sm text-gray-500 dark:text-gray-400">Type d'examen</span>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{exam.typeExamen}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-gray-500 dark:text-gray-400" size={18} />
                <span className="text-sm text-gray-500 dark:text-gray-400">Année examen</span>
              </div>
              <p className="text-gray-900 dark:text-white font-medium">{exam.anneeExamen}</p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="text-blue-500 dark:text-blue-400" size={18} />
                <span className="text-sm text-gray-500 dark:text-gray-400">Vues</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{(exam.viewsCount ?? 0).toLocaleString()}</p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Download className="text-purple-500 dark:text-purple-400" size={18} />
                <span className="text-sm text-gray-500 dark:text-gray-400">Téléchargements</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{(exam.downloadsCount ?? 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Description */}
          {exam.description && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h4>
              <p className="text-gray-900 dark:text-white">{exam.description}</p>
            </div>
          )}

          {/* Files Info */}
          {exam.files && exam.files.length > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Fichiers ({exam.files.length})
              </h4>
              <div className="space-y-2">
                {exam.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium text-sm">
                        {file.originalName || `Fichier ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDocument({ ...file, index })}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title={`Visualiser ${file.originalName || `Fichier ${index + 1}`}`}
                      >
                        <Eye size={16} />
                      </button>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title={`Télécharger ${file.originalName || `Fichier ${index + 1}`}`}
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  </div>
                ))}
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
            onClick={() => navigate(`/examens/${exam.slug}`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <ExternalLink size={16} />
            Voir l'examen
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
          {exam.files && exam.files.length > 0 && (
            <div className="flex gap-2">
              {exam.files.map((file, index) => (
                <a
                  key={index}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  title={`Télécharger ${file.originalName || `Fichier ${index + 1}`}`}
                >
                  <Download size={16} />
                  {index === 0 && exam.files.length === 1 ? 'Télécharger' : `F${index + 1}`}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de visualisation des documents */}
      {showDocumentModal && (
        <div className={`fixed inset-0 z-50 ${isFullscreen ? 'bg-black' : 'bg-black/30 backdrop-blur-sm'} flex items-center justify-center p-4`}>
          <div className={`${isFullscreen ? 'w-full h-full' : 'bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh]'} relative`}>
            {/* Header de la modal */}
            {!isFullscreen && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Eye className="text-green-600 dark:text-green-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {showDocumentModal.originalName || `Fichier ${showDocumentModal.index + 1}`}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(showDocumentModal.size / 1024 / 1024).toFixed(2)} MB • {showDocumentModal.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                    title="Plein écran"
                  >
                    <Maximize2 size={20} />
                  </button>
                  <button
                    onClick={() => setShowDocumentModal(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                    title="Fermer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Contenu du document */}
            <div className={`${isFullscreen ? 'h-full' : 'h-[600px]'} bg-gray-50 dark:bg-gray-900`}>
              {renderDocumentContent(showDocumentModal)}
            </div>

            {/* Contrôles en plein écran */}
            {isFullscreen && (
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-3 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                  title="Quitter le plein écran"
                >
                  <Maximize2 size={20} className="rotate-180" />
                </button>
                <button
                  onClick={() => setShowDocumentModal(null)}
                  className="p-3 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                  title="Fermer"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
