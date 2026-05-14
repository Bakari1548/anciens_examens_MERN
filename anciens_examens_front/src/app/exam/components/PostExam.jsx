import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Upload, X, FileText, Calendar, BookOpen, Save, Loader2 } from 'lucide-react';
// import { useTheme } from '../../../context/ThemeContext';
import { postNewExam } from '../services/exam.api';
import { getAllUfrs, getFilieresByUfr, getNiveauxByFiliere } from '../../../services/ufr.api';
import { useNavigate } from 'react-router-dom';
import logoAnciensExamens from '@/assets/logo_anciens_examens.png';

export default function PostExam() {
    const [formData, setFormData] = useState({
        ufr: '',
        filiere: '',
        niveau: '',
        semestre: '',
        anneeExamen: '',
        typeExamen: '',
        matiere: '',
        description: '',
        files: []
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // États pour les options dynamiques
    const [ufrOptions, setUfrOptions] = useState([]);
    const [filiereOptions, setFiliereOptions] = useState([]);
    const [niveauOptions, setNiveauOptions] = useState([]);
    const [semestreOptions, setSemestreOptions] = useState([]);
    const [loadingUfrs, setLoadingUfrs] = useState(false);
    const [loadingFilieres, setLoadingFilieres] = useState(false);
    const [loadingNiveaux, setLoadingNiveaux] = useState(false);

    // Charger les UFR au montage
    useEffect(() => {
        const loadUfrs = async () => {
            try {
                setLoadingUfrs(true);
                const response = await getAllUfrs();
                setUfrOptions(response.data || []);
            } catch (error) {
                toast.error('Erreur lors du chargement des UFR');
                console.error(error);
            } finally {
                setLoadingUfrs(false);
            }
        };
        loadUfrs();
    }, []);

    // Charger les filières quand l'UFR change
    useEffect(() => {
        if (formData.ufr) {
            const loadFilieres = async () => {
                try {
                    setLoadingFilieres(true);
                    const response = await getFilieresByUfr(formData.ufr);
                    setFiliereOptions(response.data || []);
                    // Réinitialiser les champs dépendants
                    setFormData(prev => ({ ...prev, filiere: '', niveau: '', semestre: '' }));
                    setNiveauOptions([]);
                    setSemestreOptions([]);
                } catch (error) {
                    toast.error('Erreur lors du chargement des filières');
                    console.error(error);
                    setFiliereOptions([]);
                } finally {
                    setLoadingFilieres(false);
                }
            };
            loadFilieres();
        } else {
            setFiliereOptions([]);
            setNiveauOptions([]);
            setSemestreOptions([]);
        }
    }, [formData.ufr]);

    // Charger les niveaux quand la filière change
    useEffect(() => {
        if (formData.ufr && formData.filiere) {
            const loadNiveaux = async () => {
                try {
                    setLoadingNiveaux(true);
                    const response = await getNiveauxByFiliere(formData.ufr, formData.filiere);
                    setNiveauOptions(response.data || []);
                    // Réinitialiser les champs dépendants
                    setFormData(prev => ({ ...prev, niveau: '', semestre: '' }));
                    setSemestreOptions([]);
                } catch (error) {
                    toast.error('Erreur lors du chargement des niveaux');
                    console.error(error);
                    setNiveauOptions([]);
                } finally {
                    setLoadingNiveaux(false);
                }
            };
            loadNiveaux();
        } else {
            setNiveauOptions([]);
            setSemestreOptions([]);
        }
    }, [formData.ufr, formData.filiere]);

    // Mettre à jour les semestres quand le niveau change
    useEffect(() => {
        if (formData.niveau) {
            const niveau = niveauOptions.find(n => n.name === formData.niveau);
            if (niveau) {
                setSemestreOptions(niveau.semestres.map(s => ({ value: s, label: s })));
                // Réinitialiser le semestre
                setFormData(prev => ({ ...prev, semestre: '' }));
            }
        } else {
            setSemestreOptions([]);
        }
    }, [formData.niveau, niveauOptions]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'files') {
            setFormData(prev => {
                const currentFiles = prev.files || [];
                const newFiles = Array.from(files) || [];
                const totalFiles = currentFiles.length + newFiles.length;
                
                if (totalFiles > 5) {
                    toast.error(`Vous ne pouvez ajouter que 5 fichiers maximum. Actuel : ${currentFiles.length}, Tentative : ${newFiles.length}`);
                    return prev;
                }
                
                return {
                    ...prev,
                    files: [...currentFiles, ...newFiles]
                };
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFormData(prev => {
            const currentFiles = prev.files || [];
            const totalFiles = currentFiles.length + droppedFiles.length;
            
            if (totalFiles > 5) {
                toast.error(`Vous ne pouvez ajouter que 5 fichiers maximum. Actuel : ${currentFiles.length}`);
                return prev;
            }
            
            return {
                ...prev,
                files: [...currentFiles, ...droppedFiles]
            };
        });
    };

    const removeFile = (index) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.ufr || !formData.filiere || !formData.niveau || !formData.semestre || 
            !formData.typeExamen || !formData.matiere || formData.files.length === 0) {
            toast.error('Veuillez remplir les champs obligatoires avec le (*), y compris au moins un fichier');
            return;
        }


        // Validation des fichiers
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        for (const file of formData.files) {
            if (!allowedTypes.includes(file.type)) {
                toast.error(`Type de fichier non supporté : ${file.name}. Veuillez utiliser PDF, JPG, PNG ou GIF`);
                return;
            }
            if (file.size > maxSize) {
                toast.error(`Le fichier ${file.name} est trop volumineux. Taille maximale : 10MB`);
                return;
            }
        }

        try {
            setLoading(true);
            
            // Créer FormData pour l'upload de fichiers multiples
            const examData = new FormData();
            examData.append('ufr', formData.ufr);
            examData.append('filiere', formData.filiere);
            examData.append('niveau', formData.niveau);
            examData.append('semestre', formData.semestre);
            examData.append('anneeExamen', formData.anneeExamen);
            examData.append('typeExamen', formData.typeExamen);
            examData.append('matiere', formData.matiere);
            // examData.append('description', formData.description);
            if (formData.description && formData.description.trim() !== "") {
                examData.append('description', formData.description);
            }
            
            // Ajouter tous les fichiers
            formData.files.forEach((file) => {
                examData.append('files', file);
            });

            // Debug: Log des données envoyées
            console.log('Données FormData envoyées:');
            for (let [key, value] of examData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}:`, value.name, value.type, value.size);
                } else {
                    console.log(`${key}:`, value);
                }
            }

            const response = await postNewExam(examData);
            console.log('Response:', response);
            toast.success('Examen partagé avec succès !');
            
            // Rediriger vers la page de détails de l'examen
            setTimeout(() => {
                navigate(`/examen/${response.exam.slug}`);
            }, 1500);
            
        } catch (error) {
            console.error('Erreur détaillée:', error);

            let errorMessage = "Erreur lors du partage de l'examen";
            let hint = null;

            if (error.response) {
                // Le serveur a répondu avec un code d'erreur (4xx / 5xx)
                const status = error.response.status;
                const data = error.response.data || {};
                const serverMsg = data.message;

                switch (status) {
                    case 400:
                        // Validation, type de fichier non supporté, etc.
                        errorMessage = serverMsg || 'Données invalides. Vérifiez vos informations.';
                        if (serverMsg && /type de fichier/i.test(serverMsg)) {
                            hint = 'Formats acceptés : PDF, JPG, PNG, GIF.';
                        }
                        break;
                    case 401:
                        errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
                        break;
                    case 403:
                        errorMessage = "Vous n'avez pas l'autorisation de partager un examen.";
                        break;
                    case 408:
                        errorMessage = "Délai d'attente dépassé.";
                        hint = 'Vérifiez votre connexion et réessayez.';
                        break;
                    case 413:
                        errorMessage = 'Fichier trop volumineux (max 10 Mo par fichier).';
                        break;
                    case 415:
                        errorMessage = 'Type de fichier non supporté (PDF, JPG, PNG, GIF uniquement).';
                        break;
                    case 500:
                    case 502:
                    case 503:
                    case 504:
                        errorMessage = 'Le serveur rencontre un problème.';
                        hint = 'Réessayez dans quelques instants.';
                        break;
                    default:
                        errorMessage = serverMsg || errorMessage;
                }
            } else if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')) {
                errorMessage = "Délai d'attente dépassé.";
                hint = 'Connexion trop lente. Réessayez avec une meilleure connexion.';
            } else if (error.code === 'ERR_NETWORK' || error.request) {
                // Pas de réponse du serveur — typique des coupures mobiles
                errorMessage = 'Connexion interrompue.';
                hint = window.innerWidth <= 768
                    ? 'Vérifiez votre réseau mobile (4G/Wi-Fi) et réessayez.'
                    : 'Vérifiez votre connexion internet et réessayez.';
            } else {
                errorMessage = error.message || errorMessage;
            }

            toast.error(errorMessage);
            if (hint) {
                setTimeout(() => toast.info(hint), 600);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-0 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Formulaire pleine largeur */}
                    <div className="sm:p-8 p-3 lg:p-12">
                            <div className="mb-8 text-center">
                                <div className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-4">
                                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg> */}
                                    <img src={logoAnciensExamens} alt="" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Partager un examen</h1>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    Contribuez à la communauté en partageant vos anciens examens. 
                                    Lisez les champs obligatoires avant de soumettre.
                                </p>
                            </div>
                            
                            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
                                {/* Section Fichier - Prioritaire */}
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl sm:p-8 px-4 py-8 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <div className="bg-purple-600 text-white p-2 rounded-lg mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        Télécharger votre examen *
                                    </h3>
                                    <div className="bg-white rounded-lg p-6 border border-purple-200">
                                        <div 
                                            className="text-center mb-4"
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                        >
                                            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-purple-600">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-700 font-medium mb-2">Glissez-déposez vos fichiers ici</p>
                                            <p className="text-sm text-gray-500">ou cliquez pour sélectionner plusieurs fichiers</p>
                                        </div>
                                        <input 
                                            type="file" 
                                            name="files" 
                                            onChange={handleChange}
                                            accept=".pdf,.jpg,.jpeg,.png,.gif"
                                            multiple
                                            className="w-full px-4 py-6 border-2 border-dashed border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 file:cursor-pointer hover:file:bg-purple-100 text-center cursor-pointer"
                                            required
                                        />
                                        
                                        {/* Affichage des fichiers sélectionnés */}
                                        {formData.files.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                    {formData.files.length} fichier(s) sélectionné(s) :
                                                </p>
                                                {formData.files.map((file, index) => (
                                                    <div key={index} className="relative flex items-center overflow-hidden justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2 text-green-600">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-sm text-green-800 font-medium truncate">{file.name}</p>
                                                                <p className="text-xs text-green-600">
                                                                    Taille : {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(index)}
                                                            className="absolute right-2 bg-red-500/20 rounded-sm border border-red-300 text-red-500 hover:text-red-700 transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                            <p className="text-xs text-yellow-800 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                                Formats acceptés : PDF, JPG, PNG, GIF (max 10MB par fichier, max 5 fichiers)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section Informations académiques */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2 text-blue-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        Informations académiques
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="ufr" className="block text-sm font-medium text-gray-700 mb-2">
                                                UFR *
                                            </label>
                                            <select 
                                                name="ufr" 
                                                value={formData.ufr}
                                                onChange={handleChange}
                                                disabled={loadingUfrs}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            >
                                                <option value="">
                                                    {loadingUfrs ? 'Chargement...' : 'Sélectionnez une UFR'}
                                                </option>
                                                {ufrOptions.map(ufr => (
                                                    <option key={ufr.code} value={ufr.name}>
                                                        {ufr.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {loadingUfrs && (
                                                <div className="mt-1 text-xs text-gray-500">Chargement des UFR...</div>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="filiere" className="block text-sm font-medium text-gray-700 mb-2">
                                                Filière *
                                            </label>
                                            <select 
                                                name="filiere" 
                                                value={formData.filiere}
                                                onChange={handleChange}
                                                disabled={!formData.ufr || loadingFilieres}
                                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${!formData.ufr || loadingFilieres ? 'opacity-50' : ''}`}
                                            >
                                                <option value="">
                                                    {!formData.ufr ? 'Sélectionnez d\'abord une UFR' : 
                                                     loadingFilieres ? 'Chargement...' : 'Sélectionnez une filière'}
                                                </option>
                                                {filiereOptions.map(filiere => (
                                                    <option key={filiere.code} value={filiere.name}>
                                                        {filiere.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {loadingFilieres && (
                                                <div className="mt-1 text-xs text-gray-500">Chargement des filières...</div>
                                            )}
                                            {!formData.ufr && (
                                                <div className="mt-1 text-xs text-gray-400">Veuillez d'abord sélectionner une UFR</div>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="niveau" className="block text-sm font-medium text-gray-700 mb-2">
                                                Niveau *
                                            </label>
                                            <select 
                                                name="niveau" 
                                                value={formData.niveau}
                                                onChange={handleChange}
                                                disabled={!formData.filiere || loadingNiveaux}
                                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${!formData.filiere || loadingNiveaux ? 'opacity-50' : ''}`}
                                            >
                                                <option value="">
                                                    {!formData.filiere ? 'Sélectionnez d\'abord une filière' : 
                                                     loadingNiveaux ? 'Chargement...' : 'Sélectionnez un niveau'}
                                                </option>
                                                {niveauOptions.map(niveau => (
                                                    <option key={niveau.name} value={niveau.name}>
                                                        {niveau.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {loadingNiveaux && (
                                                <div className="mt-1 text-xs text-gray-500">Chargement des niveaux...</div>
                                            )}
                                            {!formData.filiere && (
                                                <div className="mt-1 text-xs text-gray-400">Veuillez d'abord sélectionner une filière</div>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="semestre" className="block text-sm font-medium text-gray-700 mb-2">
                                                Semestre *
                                            </label>
                                            <select 
                                                name="semestre" 
                                                value={formData.semestre}
                                                onChange={handleChange}
                                                disabled={!formData.niveau}
                                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${!formData.niveau ? 'opacity-50' : ''}`}
                                            >
                                                <option value="">
                                                    {!formData.niveau ? 'Sélectionnez d\'abord un niveau' : 'Sélectionnez un semestre'}
                                                </option>
                                                {semestreOptions.map(semestre => (
                                                    <option key={semestre.value} value={semestre.value}>
                                                        {semestre.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {!formData.niveau && (
                                                <div className="mt-1 text-xs text-gray-400">Veuillez d'abord sélectionner un niveau</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section Détails de l'examen */}
                                <div className="bg-blue-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2 text-blue-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Détails de l'examen
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="anneeExamen" className="block text-sm font-medium text-gray-700 mb-2">
                                                Année de l'examen
                                            </label>
                                            <input 
                                                type="text" 
                                                name="anneeExamen" 
                                                value={formData.anneeExamen}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                                                placeholder="Ex: 2024"
                                                maxLength={4}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="typeExamen" className="block text-sm font-medium text-gray-700 mb-2">
                                                Type d'examen *
                                            </label>
                                            <select 
                                                name="typeExamen" 
                                                value={formData.typeExamen}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            >
                                                <option value="">Sélectionnez un type</option>
                                                <option value="Examen Final">Examen Final</option>
                                                <option value="Session de Rattrapage">Session de Rattrapage</option>
                                                <option value="Devoir">Devoir</option>
                                                <option value="TD/TP">TD/TP</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="matiere" className="block text-sm font-medium text-gray-700 mb-2">
                                                Matière *
                                            </label>
                                            <input
                                                type="text"
                                                name="matiere"
                                                value={formData.matiere}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                placeholder="Ex: Mathématiques"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section Description */}
                                <div className="bg-green-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2 text-green-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Description (facultatif)
                                    </h3>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                                        rows={4}
                                        placeholder="Ajoutez une description pour aider les autres étudiants à savoir le contenu de l'examen..."
                                    />
                                </div>

                                {/* Bouton de soumission */}
                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Ajout en cours...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                                Partager l'examen
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                    </div>
                </div>
            </div>
        </div>
    );
}