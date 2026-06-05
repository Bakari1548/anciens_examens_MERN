import { useState } from 'react';
import { X, Download, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ExamViewer({ exam, isUserLoggedIn, onDownload }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Obtenir le fichier actuel
  const currentFile = exam.files && exam.files.length > 0 && currentFileIndex < exam.files.length ? exam.files[currentFileIndex] : null;
  const fileUrl = currentFile ? currentFile.url : null;
  const mimeType = currentFile ? currentFile.mimeType : exam.mimeType;

  // Navigation entre fichiers
  const goToPreviousFile = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    }
  };

  const goToNextFile = () => {
    if (currentFileIndex < exam.files.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    }
  };

  const handleDownloadClick = () => {
    if (!isUserLoggedIn) {
      alert('Vous devez être connecté pour télécharger cet examen');
      return;
    }
    onDownload();
  };

  const renderContent = () => {
    if (!fileUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          Aucun fichier disponible
        </div>
      );
    }

    if (mimeType === 'application/pdf') {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-full"
          title={exam.title}
        />
      );
    } else {
      return (
        <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
          <img
            src={fileUrl}
            alt={exam.title}
            className="max-w-full max-h-full object-contain cursor-zoom-in"
          />
        </div>
      );
    }
  };

  return (
    <>
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
        {/* Barre d'outils */}
        <div className="flex items-center justify-between gap-2 bg-gray-100 px-4 py-2 border-b">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-sm font-medium text-gray-700 truncate">
              {exam.title}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Navigation entre fichiers */}
            {exam.files && exam.files.length > 1 && (
              <>
                <button
                  onClick={goToPreviousFile}
                  disabled={currentFileIndex === 0}
                  className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Fichier précédent"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-600 px-2">
                  {currentFileIndex + 1} / {exam.files.length}
                </span>
                <button
                  onClick={goToNextFile}
                  disabled={currentFileIndex === exam.files.length - 1}
                  className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Fichier suivant"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
            {/* <button
              onClick={handleDownloadClick}
              className={`p-2 rounded-lg transition-colors ${
                isUserLoggedIn
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={isUserLoggedIn ? 'Télécharger' : 'Connectez-vous pour télécharger'}
            >
              <Download size={16} />
            </button> */}
            <button
              onClick={handleFullscreen}
              className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              title="Plein écran"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
        
        {/* Contenu du document */}
        <div className="w-full h-[600px] bg-gray-50">
          {renderContent()}
        </div>
      </div>

      {/* Modal plein écran */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col">
            {/* Barre d'outils plein écran */}
            <div className="flex items-center justify-between gap-2 bg-gray-900 px-4 py-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-white font-medium truncate">
                  {exam.title}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Navigation entre fichiers */}
                {exam.files && exam.files.length > 1 && (
                  <>
                    <button
                      onClick={goToPreviousFile}
                      disabled={currentFileIndex === 0}
                      className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Fichier précédent"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-white text-sm px-2">
                      {currentFileIndex + 1} / {exam.files.length}
                    </span>
                    <button
                      onClick={goToNextFile}
                      disabled={currentFileIndex === exam.files.length - 1}
                      className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Fichier suivant"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                {/* <button
                  onClick={handleDownloadClick}
                  className={`p-2 rounded-lg transition-colors ${
                    isUserLoggedIn
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  title={isUserLoggedIn ? 'Télécharger' : 'Connectez-vous pour télécharger'}
                >
                  <Download size={18} />
                </button> */}
                <button
                  onClick={handleFullscreen}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  title="Fermer le plein écran"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Contenu plein écran */}
            <div className="flex-1 bg-gray-100 overflow-auto">
              {mimeType === 'application/pdf' ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-full"
                  title={exam.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={fileUrl}
                    alt={exam.title}
                    className="max-w-full max-h-full object-contain cursor-zoom-in"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
