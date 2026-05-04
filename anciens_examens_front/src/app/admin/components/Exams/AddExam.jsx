import { useState, useEffect } from 'react';
import { X, Upload, FileText, Calendar, BookOpen, Save, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'sonner';
import { getAllUfrs, getFilieresByUfr, getNiveauxByFiliere } from '@/services/ufr.api';

export default function AddExam({ onClose, onAddExam }) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
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

  // États pour les options dynamiques
  const [ufrOptions, setUfrOptions] = useState([]);
  const [filiereOptions, setFiliereOptions] = useState([]);
  const [niveauOptions, setNiveauOptions] = useState([]);
  const [semestreOptions, setSemestreOptions] = useState([]);
  const [loadingUfrs, setLoadingUfrs] = useState(false);
  const [loadingFilieres, setLoadingFilieres] = useState(false);
  const [loadingNiveaux, setLoadingNiveaux] = useState(false);

  const typeExamenOptions = ['Examen Final', 'Contrôle Continu', 'Session de Rattrapage', 'Devoir', 'TP'];

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => {
      const currentFiles = prev.files || [];
      const totalFiles = currentFiles.length + files.length;
      
      if (totalFiles > 5) {
        toast.error(`Vous ne pouvez ajouter que 5 fichiers maximum. Actuel : ${currentFiles.length}, Tentative : ${files.length}`);
        return prev;
      }
      
      return {
        ...prev,
        files: [...currentFiles, ...files]
      };
    });
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
        toast.error(`Vous ne pouvez ajouter que 5 fichiers maximum. Actuel : ${currentFiles.length}, Tentative : ${droppedFiles.length}`);
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

    if (!formData.ufr || !formData.filiere || !formData.niveau || !formData.semestre || 
        !formData.anneeExamen || !formData.typeExamen || !formData.matiere || formData.files.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires, y compris au moins un fichier');
      return;
    }

    // Validation de l'année d'examen
    if (formData.anneeExamen.length !== 4) {
      toast.error('L\'année de l\'examen doit être un nombre de 4 chiffres');
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

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('ufr', formData.ufr);
      formDataToSend.append('filiere', formData.filiere);
      formDataToSend.append('niveau', formData.niveau);
      formDataToSend.append('semestre', formData.semestre);
      formDataToSend.append('anneeExamen', formData.anneeExamen);
      formDataToSend.append('typeExamen', formData.typeExamen);
      formDataToSend.append('matiere', formData.matiere);
      formDataToSend.append('description', formData.description);
      
      // Ajouter tous les fichiers
      formData.files.forEach((file) => {
        formDataToSend.append('files', file);
      });

      await onAddExam(formDataToSend);
      toast.success('Examen créé avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création de l\'examen:', error);
      toast.error(error.message || 'Erreur lors de la création de l\'examen');
    } finally {
      setLoading(false);
    }
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ajouter un examen</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Remplissez les informations de l'examen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section Informations académiques */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations académiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  UFR *
                </label>
                <select
                  required
                  value={formData.ufr}
                  onChange={(e) => setFormData(prev => ({ ...prev, ufr: e.target.value }))}
                  disabled={loadingUfrs}
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed ${!formData.ufr || loadingUfrs ? 'opacity-50' : ''}`}
                >
                  <option value="">
                    {loadingUfrs ? 'Chargement...' : 'Sélectionner une UFR'}
                  </option>
                  {ufrOptions.map(ufr => (
                    <option key={ufr.code} value={ufr.name}>{ufr.name}</option>
                  ))}
                </select>
                {loadingUfrs && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Chargement des UFR...</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filière *
                </label>
                <select
                  required
                  value={formData.filiere}
                  onChange={(e) => setFormData(prev => ({ ...prev, filiere: e.target.value }))}
                  disabled={!formData.ufr || loadingFilieres}
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed ${!formData.ufr || loadingFilieres ? 'opacity-50' : ''}`}
                >
                  <option value="">
                    {!formData.ufr ? 'Sélectionnez d\'abord une UFR' : 
                     loadingFilieres ? 'Chargement...' : 'Sélectionner une filière'}
                  </option>
                  {filiereOptions.map(filiere => (
                    <option key={filiere.code} value={filiere.name}>{filiere.name}</option>
                  ))}
                </select>
                {loadingFilieres && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Chargement des filières...</div>
                )}
                {!formData.ufr && (
                  <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">Veuillez d'abord sélectionner une UFR</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Niveau *
                </label>
                <select
                  required
                  value={formData.niveau}
                  onChange={(e) => setFormData(prev => ({ ...prev, niveau: e.target.value }))}
                  disabled={!formData.filiere || loadingNiveaux}
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed ${!formData.filiere || loadingNiveaux ? 'opacity-50' : ''}`}
                >
                  <option value="">
                    {!formData.filiere ? 'Sélectionnez d\'abord une filière' : 
                     loadingNiveaux ? 'Chargement...' : 'Sélectionner un niveau'}
                  </option>
                  {niveauOptions.map(niveau => (
                    <option key={niveau.name} value={niveau.name}>{niveau.name}</option>
                  ))}
                </select>
                {loadingNiveaux && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Chargement des niveaux...</div>
                )}
                {!formData.filiere && (
                  <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">Veuillez d'abord sélectionner une filière</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Semestre *
                </label>
                <select
                  required
                  value={formData.semestre}
                  onChange={(e) => setFormData(prev => ({ ...prev, semestre: e.target.value }))}
                  disabled={!formData.niveau}
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed ${!formData.niveau ? 'opacity-50' : ''}`}
                >
                  <option value="">
                    {!formData.niveau ? 'Sélectionnez d\'abord un niveau' : 'Sélectionner un semestre'}
                  </option>
                  {semestreOptions.map(semestre => (
                    <option key={semestre.value} value={semestre.value}>{semestre.label}</option>
                  ))}
                </select>
                {!formData.niveau && (
                  <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">Veuillez d'abord sélectionner un niveau</div>
                )}
              </div>
            </div>
          </div>

          {/* Section Détails de l'examen */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Détails de l'examen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Année de l'examen *
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={formData.anneeExamen}
                  onChange={(e) => setFormData(prev => ({ ...prev, anneeExamen: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type d'examen *
                </label>
                <select
                  required
                  value={formData.typeExamen}
                  onChange={(e) => setFormData(prev => ({ ...prev, typeExamen: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un type</option>
                  {typeExamenOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Matière *
                </label>
                <input
                  type="text"
                  required
                  value={formData.matiere}
                  onChange={(e) => setFormData(prev => ({ ...prev, matiere: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Mathématiques"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Description de l'examen..."
            />
          </div>

          {/* Section Fichiers */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fichiers de l'examen *</h3>
            <div 
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                  >
                    <span>Télécharger plusieurs fichiers</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, JPG, PNG, GIF (max 10MB par fichier, max 5 fichiers)
                </p>
              </div>
            </div>
            
            {/* Affichage des fichiers sélectionnés */}
            {formData.files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formData.files.length} fichier(s) sélectionné(s) :
                </p>
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm text-green-800 dark:text-green-200 font-medium truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Taille : {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
