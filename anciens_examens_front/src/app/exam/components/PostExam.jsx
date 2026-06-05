import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Upload, X, FileText, Calendar, BookOpen, Save, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { postNewExam } from '../services/exam.api';
import { analyzeExamFile, checkDuplicate } from '../services/ai.api';
import { getAllUfrs, getFilieresByUfr, getNiveauxByFiliere } from '../../../services/ufr.api';
import { useNavigate, Link } from 'react-router-dom';
import logoAnciensExamens from '@/assets/logo_anciens_examens.png';
import { useTheme } from '../../admin/context/ThemeContext';

export default function PostExam() {
    const { isDark } = useTheme();
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

    // ===== IA =====
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [aiExtraction, setAiExtraction] = useState(null); // { exercises, globalSummary }
    const [aiAnalyzed, setAiAnalyzed] = useState(false);
    const [manuallyEditedFields, setManuallyEditedFields] = useState(new Set()); // Set of field names edited by user
    const [duplicateChecking, setDuplicateChecking] = useState(false);
    const [duplicateModal, setDuplicateModal] = useState(null); // { matches }
    
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

                // Déclencher l'analyse IA automatique sur le premier fichier (uniquement si pas encore analysé)
                if (!aiAnalyzed && currentFiles.length === 0 && newFiles[0]) {
                    runAIAnalysis(newFiles[0]);
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
            // Marquer le champ comme modifié manuellement
            setManuallyEditedFields(prev => new Set([...prev, name]));
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

            // Déclencher l'analyse IA automatique sur le premier fichier
            if (!aiAnalyzed && currentFiles.length === 0 && droppedFiles[0]) {
                runAIAnalysis(droppedFiles[0]);
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
        // Réinitialiser l'état IA si on retire tous les fichiers
        if (formData.files.length <= 1) {
            setAiAnalyzed(false);
            setAiExtraction(null);
            setManuallyEditedFields(new Set());
        }
    };

    // ===== Helper pour les styles des champs remplis par l'IA =====
    const getFieldClassName = (fieldName, fieldValue, baseClassName) => {
        // Si l'IA a analysé, que le champ a une valeur, et que l'utilisateur ne l'a pas modifié manuellement
        if (aiAnalyzed && fieldValue && !manuallyEditedFields.has(fieldName)) {
            return `${baseClassName} ${isDark ? 'bg-blue-500/50 ring-2 ring-blue-500 text-blue-100' : 'bg-blue-50 ring-2 ring-blue-500 text-blue-900'}`;
        }
        return baseClassName;
    };

    // ===== Analyse IA automatique du premier fichier =====
    const runAIAnalysis = async (file) => {
        if (!file) return;
        try {
            setAiAnalyzing(true);
            const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowed.includes(file.type)) return;

            toast.info('🤖 Analyse du document avec l\'IA...');
            const result = await analyzeExamFile(file);

            if (result?.metadata) {
                const m = result.metadata;
                // Pré-remplir uniquement les champs vides pour ne pas écraser une saisie utilisateur
                setFormData(prev => ({
                    ...prev,
                    ufr: prev.ufr || m.ufr || '',
                    filiere: prev.filiere || m.filiere || '',
                    niveau: prev.niveau || m.niveau || '',
                    semestre: prev.semestre || m.semestre || '',
                    anneeExamen: prev.anneeExamen || m.anneeExamen || '',
                    typeExamen: prev.typeExamen || m.typeExamen || '',
                    matiere: prev.matiere || m.matiere || '',
                    description: prev.description || m.description || ''
                }));
            }

            if (result?.aiExtraction) {
                setAiExtraction(result.aiExtraction);
                setAiAnalyzed(true);

                // Détection de doublons en arrière-plan
                if (result.aiExtraction.exercises?.length > 0) {
                    runDuplicateCheck(result.metadata, result.aiExtraction);
                }
            }

            toast.success(`✨ Analyse IA terminée (${result?.aiExtraction?.exercises?.length || 0} exercices détectés)`);
        } catch (error) {
            console.error('Erreur analyse IA:', error);
            const msg = error?.response?.data?.message;
            if (error?.response?.status === 503) {
                // Silencieux si l'IA n'est pas configurée
                console.warn('IA non configurée côté serveur');
            } else {
                toast.warning(msg || 'L\'analyse IA a échoué — remplissez le formulaire manuellement');
            }
        } finally {
            setAiAnalyzing(false);
        }
    };

    // ===== Vérification de doublons =====
    const runDuplicateCheck = async (metadata, extraction) => {
        try {
            setDuplicateChecking(true);
            const payload = {
                aiExtraction: extraction
            };

            const result = await checkDuplicate(payload);

            if (result?.isDuplicate && result.matches?.length > 0) {
                setDuplicateModal({ matches: result.matches });
            }
        } catch (error) {
            console.error('[Doublon] Erreur complète:', error);;
        } finally {
            setDuplicateChecking(false);
        }
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

            // Joindre l'extraction IA pour le cache BDD (évite un appel IA redondant côté serveur)
            if (aiExtraction && Array.isArray(aiExtraction.exercises) && aiExtraction.exercises.length > 0) {
                examData.append('aiExtraction', JSON.stringify(aiExtraction));
            }

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
                navigate(`/examens/${response.exam.slug}`);
            }, 1000);
            
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
        <div className={`min-h-screen py-12 px-0 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
            <div className="max-w-4xl mx-auto">
                <div className={`rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    {/* Formulaire pleine largeur */}
                    <div className="sm:p-8 p-3 lg:p-12">
                            <div className="mb-8 text-center">
                                <div className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-4">
                                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg> */}
                                    <img src={logoAnciensExamens} alt="Partager dans Anciens Examens" />
                                </div>
                                <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Partager un examen</h1>
                                <p className={`max-w-md mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Contribuez à la communauté en partageant vos anciens examens. 
                                    Lisez les champs obligatoires avant de soumettre.
                                </p>
                            </div>
                            
                            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
                                {/* Section Fichier - Prioritaire */}
                                <div className={`border-2 rounded-xl sm:p-8 px-4 py-8 shadow-lg ${isDark ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-purple-700' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'}`}>
                                    <h3 className={`text-xl font-bold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <div className="bg-purple-600 text-white p-2 rounded-lg mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        Télécharger votre examen *
                                    </h3>
                                    <div className={`rounded-lg p-6 border ${isDark ? 'bg-gray-700 border-purple-700' : 'bg-white border-purple-200'}`}>
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
                                            <p className={`font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Glissez-déposez vos fichiers ici</p>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ou cliquez pour sélectionner plusieurs fichiers</p>
                                        </div>
                                        <input 
                                            type="file" 
                                            name="files" 
                                            onChange={handleChange}
                                            accept=".pdf,.jpg,.jpeg,.png,.gif"
                                            multiple
                                            className={`w-full px-4 py-6 border-2 border-dashed rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:cursor-pointer text-center cursor-pointer ${isDark ? 'border-purple-600 file:bg-purple-900 file:text-purple-300 hover:file:bg-purple-800' : 'border-purple-300 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100'}`}
                                            required
                                        />
                                        
                                        {/* Badge statut IA */}
                                        {(aiAnalyzing || aiAnalyzed) && (
                                            <div className={`mt-4 rounded-lg p-3 border flex items-center gap-2 ${
                                                aiAnalyzing
                                                    ? (isDark ? 'bg-purple-900/30 border-purple-700 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-800')
                                                    : (isDark ? 'bg-green-900/30 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-800')
                                            }`}>
                                                {aiAnalyzing ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span className="text-sm font-medium">Analyse IA en cours… cela peut prendre quelques secondes</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-4 h-4" />
                                                        <span className="text-sm font-medium">
                                                            Champs pré-remplis par l'IA{aiExtraction?.exercises?.length ? ` • ${aiExtraction.exercises.length} exercices détectés` : ''}
                                                        </span>
                                                        {duplicateChecking && (
                                                            <span className="ml-2 inline-flex items-center gap-1 text-xs opacity-80">
                                                                <Loader2 className="w-3 h-3 animate-spin" /> vérification doublons…
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {/* Affichage des fichiers sélectionnés */}
                                        {formData.files.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                                    {formData.files.length} fichier(s) sélectionné(s) :
                                                </p>
                                                {formData.files.map((file, index) => (
                                                    <div key={index} className={`relative flex items-center overflow-hidden justify-between p-3 border rounded-lg ${isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'}`}>
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2 text-green-600">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <div>
                                                                <p className={`text-sm font-medium truncate ${isDark ? 'text-green-200' : 'text-green-800'}`}>{file.name}</p>
                                                                <p className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                                                    Taille : {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(index)}
                                                            className={`absolute right-2 rounded-sm border transition-colors ${isDark ? 'bg-red-500/20 border-red-700 text-red-400 hover:text-red-300' : 'bg-red-500/20 border-red-300 text-red-500 hover:text-red-700'}`}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        <div className={`mt-4 rounded-lg p-3 border ${isDark ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
                                            <p className={`text-xs flex items-center ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                                Formats acceptés : PDF, JPG, PNG, GIF (max 10MB par fichier, max 5 fichiers)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section Informations académiques */}
                                <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2 text-blue-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        Informations académiques
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="ufr" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                UFR *
                                            </label>
                                            <select
                                                name="ufr"
                                                value={formData.ufr}
                                                onChange={handleChange}
                                                disabled={loadingUfrs}
                                                className={getFieldClassName('ufr', formData.ufr, `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:cursor-not-allowed ${!loadingUfrs ? '' : ''} ${isDark ? 'border-gray-600 bg-gray-800 text-white disabled:bg-gray-800' : 'border-gray-300 disabled:bg-gray-100'}`)}
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
                                                <div className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Chargement des UFR...</div>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="filiere" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Filière *
                                            </label>
                                            <select 
                                                name="filiere" 
                                                value={formData.filiere}
                                                onChange={handleChange}
                                                disabled={!formData.ufr || loadingFilieres}
                                                className={getFieldClassName('filiere', formData.filiere, `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:cursor-not-allowed ${!formData.ufr || loadingFilieres ? 'opacity-50' : ''} ${isDark ? 'border-gray-600 bg-gray-800 text-white disabled:bg-gray-800' : 'border-gray-300 disabled:bg-gray-100'}`)}
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
                                                <div className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Chargement des filières...</div>
                                            )}
                                            {!formData.ufr && (
                                                <div className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Veuillez d'abord sélectionner une UFR</div>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="niveau" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Niveau *
                                            </label>
                                            <select 
                                                name="niveau" 
                                                value={formData.niveau}
                                                onChange={handleChange}
                                                disabled={!formData.filiere || loadingNiveaux}
                                                className={getFieldClassName('niveau', formData.niveau, `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:cursor-not-allowed ${!formData.filiere || loadingNiveaux ? 'opacity-50' : ''} ${isDark ? 'border-gray-600 bg-gray-800 text-white disabled:bg-gray-800' : 'border-gray-300 disabled:bg-gray-100'}`)}
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
                                                className={getFieldClassName('semestre', formData.semestre, `w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${!formData.niveau ? 'opacity-50' : ''} ${isDark ? 'border-gray-600 bg-gray-800 text-white disabled:bg-gray-800' : 'border-gray-300 disabled:bg-gray-100'}`)}
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
                                                <div className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Veuillez d'abord sélectionner un niveau</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section Détails de l'examen */}
                                <div className={`rounded-xl p-6 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                                    <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2 text-blue-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Détails de l'examen
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="anneeExamen" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Année de l'examen
                                            </label>
                                            <input 
                                                type="text" 
                                                name="anneeExamen" 
                                                value={formData.anneeExamen}
                                                onChange={handleChange}
                                                className={getFieldClassName('anneeExamen', formData.anneeExamen, `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`)}
                                                placeholder="Ex: 2024"
                                                maxLength={4}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="typeExamen" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Type d'examen *
                                            </label>
                                            <select 
                                                name="typeExamen" 
                                                value={formData.typeExamen}
                                                onChange={handleChange}
                                                className={getFieldClassName('typeExamen', formData.typeExamen, `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`)}
                                            >
                                                <option value="">Sélectionnez un type</option>
                                                <option value="Examen Final">Examen Final</option>
                                                <option value="Examen Partiel">Examen Partiel</option>
                                                <option value="Session de Rattrapage">Session de Rattrapage</option>
                                                <option value="Contrôle Continu">Contrôle Continu</option>
                                                <option value="Devoir">Devoir</option>
                                                <option value="TD/TP">TD/TP</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="matiere" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Matière *
                                            </label>
                                            <input
                                                type="text"
                                                name="matiere"
                                                value={formData.matiere}
                                                onChange={handleChange}
                                                className={getFieldClassName('matiere', formData.matiere, `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`)}
                                                placeholder="Ex: Mathématiques"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section Description */}
                                <div className={`rounded-xl p-6 ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                                    <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2 text-green-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Description (facultatif)
                                    </h3>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className={getFieldClassName(
                                            'description',
                                            formData.description,
                                            `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`
                                        )}
                                        rows={4}
                                        placeholder="Ajoutez une description pour aider les autres étudiants a savoir le contenu de l'examen..."
                                    />
                                </div>

                                {/* Bouton de soumission */}
                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className={`w-full text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg ${isDark ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
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

            {/* Modal de détection de doublons */}
            {duplicateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDuplicateModal(null)}>
                    <div
                        className={`max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`p-6 border-b flex items-start gap-3 ${isDark ? 'border-gray-700 bg-amber-900/20' : 'border-gray-200 bg-amber-50'}`}>
                            <AlertTriangle className="text-amber-500 flex-shrink-0 mt-1" size={28} />
                            <div className="flex-1">
                                <h2 className={`text-xl font-bold mb-1 ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
                                    Examen{duplicateModal.matches.length > 1 ? 's' : ''} similaire{duplicateModal.matches.length > 1 ? 's' : ''} détecté{duplicateModal.matches.length > 1 ? 's' : ''}
                                </h2>
                                <p className={`text-sm ${isDark ? 'text-amber-300/80' : 'text-amber-800/80'}`}>
                                    L'IA a comparé les exercices de votre examen avec ceux déjà partagés. Veuillez vérifier avant de continuer.
                                </p>
                            </div>
                            <button onClick={() => setDuplicateModal(null)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-4 flex-1">
                            {duplicateModal.matches.map((m) => {
                                const pct = Math.round((m.globalSimilarity || 0) * 100);
                                const verdictColor =
                                    m.verdict === 'exact'
                                        ? 'bg-red-100 text-red-700 border-red-300'
                                        : 'bg-amber-100 text-amber-700 border-amber-300';
                                const verdictLabel = m.verdict === 'exact' ? 'Identique' : 'Partiellement similaire';
                                return (
                                    <div key={m.examId} className={`border rounded-xl p-4 ${isDark ? 'border-gray-700 bg-gray-700/40' : 'border-gray-200 bg-gray-50'}`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{m.title}</h3>
                                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {m.ufr} • {m.filiere} • {m.matiere} {m.anneeExamen ? `• ${m.anneeExamen}` : ''}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${verdictColor}`}>
                                                {verdictLabel} • {pct}%
                                            </span>
                                        </div>

                                        {m.matchedExercises && m.matchedExercises.length > 0 && (
                                            <div className="mt-3 space-y-1">
                                                <p className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    Exercices correspondants :
                                                </p>
                                                <ul className="text-sm space-y-1">
                                                    {m.matchedExercises.slice(0, 5).map((ex, i) => (
                                                        <li key={i} className={`flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                                            <span className="text-green-500">✓</span>
                                                            <span><strong>{ex.newExNumber}</strong> ≈ {ex.existingExNumber}</span>
                                                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                ({Math.round((ex.similarity || 0) * 100)}%)
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="mt-3">
                                            <Link
                                                to={`/examens/${m.slug}`}
                                                target="_blank"
                                                className={`text-sm font-medium underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                                            >
                                                Voir cet examen →
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={`p-4 border-t flex gap-3 justify-end ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                            <button
                                type="button"
                                onClick={() => {
                                    setDuplicateModal(null);
                                    // Vider les fichiers pour annuler le partage
                                    setFormData(prev => ({ ...prev, files: [] }));
                                    setAiAnalyzed(false);
                                    setAiExtraction(null);
                                }}
                                className={`px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                            >
                                Annuler le partage
                            </button>
                            <button
                                type="button"
                                onClick={() => setDuplicateModal(null)}
                                className="px-4 py-2 rounded-lg font-medium bg-amber-500 text-white hover:bg-amber-600"
                            >
                                Partager quand même
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
