import logoFile from '@/assets/file_exam.png';
import { Download, Eye, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '../../../utils/tokenStorage';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { getFavoriteStatus, addToFavorites, removeFromFavorites, incrementExamDownload } from '../services/exam.api';

export default function CardExam({ exam }) {

    const navigate = useNavigate();
    const isUserLoggedIn = !!tokenStorage.getUser();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loadingFavorite, setLoadingFavorite] = useState(false);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (isUserLoggedIn) {
                try {
                    const response = await getFavoriteStatus(exam.slug);
                    setIsFavorite(response.isFavorite);
                } catch (error) {
                    console.error('Erreur lors de la vérification du statut favori:', error);
                }
            }
        };
        checkFavoriteStatus();
    }, [exam.slug, isUserLoggedIn]);

    const handleToggleFavorite = async (e) => {
        e.stopPropagation();
        if (!isUserLoggedIn) {
            toast.error('Vous devez être connecté pour ajouter aux favoris');
            return;
        }
        
        setLoadingFavorite(true);
        try {
            if (isFavorite) {
                await removeFromFavorites(exam.slug);
                toast.success('Retiré des favoris');
            } else {
                await addToFavorites(exam.slug);
                toast.success('Ajouté aux favoris');
            }
            
            // Rafraîchir le statut après l'action
            try {
                const response = await getFavoriteStatus(exam.slug);
                setIsFavorite(response.isFavorite);
            } catch (refreshError) {
                console.error('Erreur lors du rafraîchissement du statut:', refreshError);
            }
        } catch (error) {
            console.error('Erreur lors de la gestion des favoris:', error);
            console.error('Détails de l\'erreur:', error.response?.data || error.message);
            
            // Même en cas d'erreur, essayer de rafraîchir le statut
            try {
                const response = await getFavoriteStatus(exam.slug);
                setIsFavorite(response.isFavorite);
            } catch (refreshError) {
                console.error('Erreur lors du rafraîchissement du statut après erreur:', refreshError);
            }
            
            // Si l'erreur est 401 ou 403, c'est un problème d'authentification
            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error('Erreur d\'authentification. Veuillez vous reconnecter.');
            } else {
                toast.error('Erreur lors de la gestion des favoris');
            }
        } finally {
            setLoadingFavorite(false);
        }
    };

    const handleDownload = () => {
        if (!isUserLoggedIn) {
            toast.error('Vous devez être connecté pour télécharger cet examen');
            return;
        }
        if (!exam.files || exam.files.length === 0) {
            toast.error('Aucun fichier disponible pour cet examen');
            return;
        }
        if (!exam.files[0].url) {
            toast.error('URL du fichier non disponible');
            console.error('Structure du fichier:', exam.files[0]);
            return;
        }

        // Enregistrer le téléchargement
        incrementExamDownload(exam.slug);

        // Télécharger le premier fichier par défaut avec paramètres Cloudinary pour forcer le téléchargement
        const fileUrl = exam.files[0].url;
        const fileName = exam.title.replace(/[^a-zA-Z0-9\s-_]/g, '').trim() || 'examen';
        const downloadUrl = fileUrl.includes('cloudinary.com')
            ? fileUrl.replace(/\/upload\//, `/upload/fl_attachment:${fileName}/`)
            : fileUrl;
        window.open(downloadUrl, '_blank');
    };

    const handleReadExam = () => {
        // if (!isUserLoggedIn) {
        //     // Stocker la destination et rediriger vers login
        //     localStorage.setItem('redirectAfterLogin', `/examens/${exam.slug}`);
        //     navigate('/connexion');
        //     return;
        // }
        navigate(`/examens/${exam.slug}`);
    };

    return (
        <div className="bg-white w-full shadow flex sm:flex-row flex-col sm:justify-start justify-center items-center border border-gray-200 rounded-lg py-3 px-4 gap-4 relative">
            <button
                onClick={handleToggleFavorite}
                disabled={loadingFavorite}
                className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
                <Heart 
                    size={20} 
                    className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'} 
                />
            </button>
            <img 
                className="sm:w-52 opacity-70 w-60 sm:mx-0 mx-auto" 
                src={logoFile} 
            />
            <div className="flex flex-col gap-3 mt-3 w-full">
                <h3 className="font-semibold text-lg text-gray-800">{exam.title}</h3>
                <div className="flex flex-col justify-start items-start gap-2 mt-3">
                    <p className="text-md"><span className="font-semibold">Filière :</span> {exam.filiere}</p>
                    <p className="text-md"><span className="font-semibold">Niveau :</span> {exam.niveau}</p>
                    <p className="text-md"><span className="font-semibold">SEM :</span> {exam.semestre}</p>
                    <p className="text-md"><span className="font-semibold">Matière :</span> {exam.matiere}</p>
                    {exam.anneeExamen ? (
                        <p className="text-md"><span className="font-semibold">Année :</span> {exam.anneeExamen}</p>
                    ) : (
                        <p className="text-md"><span className="font-semibold">Année :</span> non précisée</p>
                    )}
                    {/* {exam.files && exam.files.length > 0 && (
                        <p className="text-md"><span className="font-semibold">Fichiers :</span> {exam.files.length}</p>
                    )} */}
                </div>
                <div className="flex min-[550px]:flex-row flex-col gap-6 w-full">
                    <button 
                        onClick={handleReadExam}
                        className="bg-blue-400/40 flex justify-center gap-2 text-gray-900 items-center p-2 min-[550px]:w-1/2 font-semibold rounded-lg shadow active:scale-95 hover:bg-blue-400 active:bg-blue-400 transition-all duration-200 ease-in-out"
                    >
                        <span>Lire</span>
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={handleDownload}
                        className={`flex justify-center items-center gap-2 border p-2 min-[550px]:w-1/2 text-center font-semibold rounded-lg shadow active:scale-95 transition-all duration-200 ease-in-out ${
                            isUserLoggedIn 
                                ? 'bg-transparent text-gray-900 border-gray-300 hover:bg-gray-100 active:bg-gray-600'
                                : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                        }`}
                    >
                        <span>Télécharger</span>
                        <Download size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}