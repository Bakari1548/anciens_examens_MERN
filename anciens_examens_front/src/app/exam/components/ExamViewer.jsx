import { useState } from 'react';
import { X, Download, Maximize2 } from 'lucide-react';

export default function ExamViewer({ exam, isUserLoggedIn, onDownload }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownloadClick = () => {
    if (!isUserLoggedIn) {
      alert('Vous devez être connecté pour télécharger cet examen');
      return;
    }
    onDownload();
  };

  const renderContent = () => {
    if (exam.mimeType === 'application/pdf') {
      return (
        <iframe
          src={exam.filePath}
          className="w-full h-full"
          title={exam.title}
        />
      );
    } else {
      return (
        <img
          src={exam.filePath}
          alt={exam.title}
          className="w-full h-full"
          style={{
            objectFit: 'contain',
            cursor: isFullscreen ? 'zoom-in' : 'default'
          }}
        />
      );
    }
  };

  return (
    <>
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
        {/* Barre d'outils */}
        <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
              {exam.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadClick}
              className={`p-2 rounded-lg transition-colors ${
                isUserLoggedIn
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={isUserLoggedIn ? 'Télécharger' : 'Connectez-vous pour télécharger'}
            >
              <Download size={16} />
            </button>
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
            <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium truncate max-w-md">
                  {exam.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadClick}
                  className={`p-2 rounded-lg transition-colors ${
                    isUserLoggedIn
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  title={isUserLoggedIn ? 'Télécharger' : 'Connectez-vous pour télécharger'}
                >
                  <Download size={18} />
                </button>
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
              {exam.mimeType === 'application/pdf' ? (
                <iframe
                  src={exam.filePath}
                  className="w-full h-full"
                  title={exam.title}
                />
              ) : (
                <div className="min-w-full min-h-full flex items-center justify-center p-4">
                  <img
                    src={exam.filePath}
                    alt={exam.title}
                    className="max-w-none"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      cursor: 'zoom-in'
                    }}
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
