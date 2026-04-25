import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Download, FileText, Calendar, User, Heart, MessageSquare, Send, ThumbsUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getExamBySlug } from '../services/exam.api';
import { toast } from 'sonner';

export default function ExamDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // États
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);

  // Récupérer les détails de l'examen
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const response = await getExamBySlug(slug);
        setExam(response.exam);
        setLikesCount(response.exam.likesCount || 0);
        setComments(response.exam.comments || []);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'examen:', error);
        toast.error('Examen non trouvé');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchExam();
    }
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
          <p className="mt-4 text-gray-600">Chargement de l'examen...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">Examen non trouvé</h2>
          <Link to="/" className="text-blue-600 hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    if (exam.filePath) {
      const link = document.createElement('a');
      link.href = exam.filePath;
      link.download = `${exam.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.info('Fichier non disponible pour le téléchargement');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        user: 'current_user', // En production, utiliser l'ID de l'utilisateur connecté
        content: newComment,
        createdAt: new Date(),
      };
      setComments([...comments, newCommentObj]);
      setNewComment('');
      toast.success('Commentaire ajouté');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec bouton retour */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/examens')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche - Détails de l'examen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="bg-blue-100 p-4 rounded-lg flex justify-center mb-6">
                <FileText className="text-blue-600" size={48} />
              </div>

              <h1 className="mb-4">{exam.title}</h1>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar size={20} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Année de l'examen</p>
                    <p className="font-medium">{exam.year}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User size={20} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Téléversé par</p>
                    <p className="font-medium">{exam.author?.firstName || 'Utilisateur'}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">UFR</p>
                  <p className="font-medium">{exam.ufr}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Filière</p>
                  <p className="font-medium">{exam.filiere}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Matière</p>
                  <p className="font-medium">{exam.matiere}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Date de création</p>
                  <p className="font-medium">{new Date(exam.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="bg-blue-500 flex justify-center gap-2 text-white items-center p-2 w-full font-semibold rounded-lg shadow active:scale-95 hover:bg-blue-600 active:bg-blue-600 transition-all duration-200 ease-in-out"
              >
                <Download size={20} />
                <span>Télécharger l'examen</span>
              </button>
            </div>
          </div>

          {/* Colonne de droite - Visualiseur de document */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {/* <h2 className="mb-4">Aperçu du document</h2> */}
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                {exam.mimeType === 'application/pdf' ? (
                  <iframe
                    src={exam.filePath}
                    className="w-full h-[800px]"
                    title={exam.title}
                  />
                ) : (
                  <img
                    src={exam.filePath}
                    alt={exam.title}
                    className="w-full h-auto"
                  />
                )}
              </div>
            </div>

            {/* Section Likes et Commentaires */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Bouton Like */}
              <div className="border-b pb-4 mb-6">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <ThumbsUp size={24} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={2} />
                  <span className="text-lg font-medium text-gray-700">{likesCount} likes</span>
                </button>
              </div>

              {/* Section Commentaires */}
              <div>
                <h3 className="mb-4">Commentaires ({comments.length})</h3>
                
                {/* Formulaire d'ajout de commentaire */}
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={20} className="text-gray-500" />
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      placeholder="Ajouter un commentaire..."
                      className="flex-1 bg-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddComment}
                      className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>

                {/* Liste des commentaires */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-200 text-blue-700 font-bold w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                          {comment.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{comment.author}</p>
                            <span className="text-gray-400">•</span>
                            <p className="text-sm text-gray-500">{comment.date}</p>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}