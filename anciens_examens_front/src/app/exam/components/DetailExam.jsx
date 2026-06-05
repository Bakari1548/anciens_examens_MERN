import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, FileText, Calendar, User, Heart, MessageSquare, Send, ThumbsUp, Download } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getExamBySlug, getLikeStatus, likeExam, unlikeExam, getComments, addComment, deleteComment, getFavoriteStatus, addToFavorites, removeFromFavorites, incrementExamView, incrementExamDownload } from '../services/exam.api';
import { toast } from 'sonner';
import ExamViewer from './ExamViewer';
import AIChatWidget from './AIChatWidget';
import { tokenStorage } from '../../../utils/tokenStorage';

export default function ExamDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // États
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);

  // Vérifier si l'utilisateur est connecté
  const isUserLoggedIn = !!tokenStorage.getUser();

  // Récupérer les détails de l'examen
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const response = await getExamBySlug(slug);
        setExam(response.exam);
        setLikesCount(response.exam.likesCount || 0);

        // Enregistrer la vue de l'examen (seulement si connecté)
        const token = tokenStorage.getToken();
        if (token) {
          incrementExamView(slug);
        }

        // Récupérer les commentaires avec les infos utilisateur peuplées
        try {
          const commentsResponse = await getComments(slug);
          setComments(commentsResponse.comments || []);
        } catch (error) {
          console.error('Erreur lors de la récupération des commentaires:', error);
          setComments([]);
        }

        // Si l'utilisateur est connecté, vérifier le statut du like et du favori
        if (isUserLoggedIn) {
          try {
            const likeResponse = await getLikeStatus(slug);
            setIsLiked(likeResponse.isLiked);
          } catch (error) {
            console.error('Erreur lors de la vérification du like:', error);
          }

          try {
            const favoriteResponse = await getFavoriteStatus(slug);
            setIsFavorite(favoriteResponse.isFavorite);
          } catch (error) {
            console.error('Erreur lors de la vérification du favori:', error);
          }
        }
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
  }, [slug, navigate, isUserLoggedIn]);

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

  const handleDownload = (fileIndex = 0) => {
    if (exam.files && exam.files.length > 0) {
      const file = exam.files[fileIndex];
      
      // Enregistrer le téléchargement
      incrementExamDownload(slug);
      
      const link = document.createElement('a');
      link.href = file.url;
      link.target = '_blank';
      link.download = file.originalName || `${exam.title}_${fileIndex + 1}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.info('Fichier non disponible pour le téléchargement');
    }
  };

  const handleLike = async () => {
    if (!isUserLoggedIn) {
      toast.error('Vous devez être connecté pour liker un examen');
      return;
    }
    
    try {
      if (isLiked) {
        await unlikeExam(slug);
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        toast.success('Like retiré');
      } else {
        await likeExam(slug);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        toast.success('Examen liké !');
      }
    } catch (error) {
      console.error('Erreur lors du like:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du like');
    }
  };

  const handleToggleFavorite = async () => {
    if (!isUserLoggedIn) {
      toast.error('Vous devez être connecté pour ajouter aux favoris');
      return;
    }
    
    setLoadingFavorite(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(slug);
        setIsFavorite(false);
        toast.success('Retiré des favoris');
      } else {
        await addToFavorites(slug);
        setIsFavorite(true);
        toast.success('Ajouté aux favoris');
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      console.error('Détails de l\'erreur:', error.response?.data || error.message);
      toast.error('Erreur lors de la gestion des favoris');
    } finally {
      setLoadingFavorite(false);
    }
  };

  const handleAddComment = async () => {
    if (!isUserLoggedIn) {
      toast.error('Vous devez être connecté pour commenter');
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Le commentaire ne peut pas être vide');
      return;
    }
    
    if (newComment.length > 500) {
      toast.error('Le commentaire ne peut pas dépasser 500 caractères');
      return;
    }
    
    try {
      const response = await addComment(slug, newComment);
      setComments([...comments, response.comment]);
      setNewComment('');
      toast.success('Commentaire ajouté');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du commentaire');
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    if (!isUserLoggedIn) {
      toast.error('Vous devez être connecté pour supprimer un commentaire');
      return;
    }
    
    try {
      await deleteComment(slug, commentId);
      setComments(comments.filter(comment => comment._id !== commentId));
      toast.success('Commentaire supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleShare = () => {
    const examUrl = `${window.location.origin}/examens/${exam.slug}`;
    const shareMessage = `📚 *${exam.title}*\n\n` +
      `🎓 UFR: ${exam.ufr}\n` +
      `📖 Filière: ${exam.filiere}\n` +
      `📊 Niveau: ${exam.niveau}\n` +
      `📅 Semestre: ${exam.semestre}\n` +
      `📝 Type: ${exam.typeExamen}\n` +
      `📚 Matière: ${exam.matiere}\n` +
      `📆 Année: ${exam.anneeExamen}\n\n` +
      `🔗 *Lien*: ${examUrl}\n\n` +
      `Consulte cet examen sur Anciens Examens UIDT!`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Ouverture de WhatsApp...');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec bouton retour */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
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
                    <p className="font-medium">{exam.anneeExamen}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User size={20} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Partagé par</p>
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
                  <p className="text-sm text-gray-500">Niveau</p>
                  <p className="font-medium">{exam.niveau}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Semestre</p>
                  <p className="font-medium">{exam.semestre}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Type d'examen</p>
                  <p className="font-medium">{exam.typeExamen}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Matière</p>
                  <p className="font-medium">{exam.matiere}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Date de création</p>
                  <p className="font-medium">{new Date(exam.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>

                {exam.description && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 mb-2">Description</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{exam.description}</p>
                  </div>
                )}
              </div>

              {exam.files && exam.files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 text-center">
                  {exam.files.length} fichier{exam.files.length > 1 ? 's' : ''} disponible{exam.files.length > 1 ? 's' : ''}
                </p>
                {exam.files.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isUserLoggedIn) {
                        toast.error('Vous devez être connecté pour télécharger cet examen');
                        return;
                      }
                      handleDownload(index);
                    }}
                    className={`flex justify-center gap-2 text-white items-center p-2 w-full font-semibold rounded-lg shadow active:scale-95 transition-all duration-200 ease-in-out ${
                      isUserLoggedIn 
                        ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-600' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Download size={20} />
                    <span>Télécharger fichier {index + 1}</span>
                  </button>
                ))}
              </div>
            )}
            </div>
          </div>

          {/* Colonne de droite - Visualiseur de document */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <ExamViewer 
                exam={exam} 
                isUserLoggedIn={isUserLoggedIn}
                onDownload={handleDownload}
              />
            </div>

            {/* Section Likes et Commentaires */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Boutons Like et Favori */}
              <div className="flex items-center gap-6 border-b pb-4 mb-6">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <ThumbsUp size={24} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={2} />
                  <span className="text-lg font-medium text-gray-700">{likesCount} likes</span>
                </button>
                <button
                  onClick={handleToggleFavorite}
                  disabled={loadingFavorite}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2} />
                  <span className="text-lg font-medium text-gray-700">Favori</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-green-500 hover:text-green-600 transition-colors"
                >
                  <FaWhatsapp size={24} />
                  <span className="text-lg font-medium text-gray-700">Partager</span>
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
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucun commentaire. Soyez le premier à commenter !</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-200 text-blue-700 font-bold w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                            {comment.user?.firstName?.charAt(0)}{comment.user?.lastName?.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{comment.user?.firstName} {comment.user?.lastName}</p>
                                <span className="text-gray-400">•</span>
                                <p className="text-sm text-gray-500">
                                  {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              {/* Bouton supprimer pour l'auteur du commentaire ou de l'examen */}
                              {isUserLoggedIn && (comment.user?._id === tokenStorage.getUser()?._id || exam.author?._id === tokenStorage.getUser()?._id) && (
                                <button
                                  onClick={() => handleDeleteComment(comment._id)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  Supprimer
                                </button>
                              )}
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Widget chat IA flottant */}
      <AIChatWidget exam={exam} />
    </div>
  );
}