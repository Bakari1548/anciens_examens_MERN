import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { X, Send, Loader2, Building2, GraduationCap, Calendar, BookOpen, FileText } from 'lucide-react';
import { getAllUfrs, getFilieresByUfr, getNiveauxByFiliere } from '@/services/ufr.api';
import { createExamRequest } from '../../services/examRequest.api';

const TYPE_EXAMEN_OPTIONS = [
    { value: '', label: 'Non précisé' },
    { value: 'Examen Final', label: 'Examen Final' },
    { value: 'Examen Partiel', label: 'Examen Partiel' },
    { value: 'Session de Rattrapage', label: 'Session de Rattrapage' },
    { value: 'Contrôle Continu', label: 'Contrôle Continu' },
    { value: 'Devoir', label: 'Devoir' },
    { value: 'TD/TP', label: 'TD/TP' },
];

export default function NewExamRequestModal({ onClose, onCreated }) {
    const [formData, setFormData] = useState({
        ufr: '',
        filiere: '',
        niveau: '',
        semestre: '',
        matiere: '',
        typeExamen: '',
        anneeExamen: '',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const [ufrOptions, setUfrOptions] = useState([]);
    const [filiereOptions, setFiliereOptions] = useState([]);
    const [niveauOptions, setNiveauOptions] = useState([]);
    const [semestreOptions, setSemestreOptions] = useState([]);
    const [loadingUfrs, setLoadingUfrs] = useState(false);
    const [loadingFilieres, setLoadingFilieres] = useState(false);
    const [loadingNiveaux, setLoadingNiveaux] = useState(false);

    useEffect(() => {
        const loadUfrs = async () => {
            try {
                setLoadingUfrs(true);
                const response = await getAllUfrs();
                setUfrOptions(response.data || []);
            } catch (error) {
                toast.error('Erreur lors du chargement des UFR');
            } finally {
                setLoadingUfrs(false);
            }
        };
        loadUfrs();
    }, []);

    useEffect(() => {
        if (!formData.ufr) {
            setFiliereOptions([]);
            setNiveauOptions([]);
            setSemestreOptions([]);
            return;
        }
        const loadFilieres = async () => {
            try {
                setLoadingFilieres(true);
                const response = await getFilieresByUfr(formData.ufr);
                setFiliereOptions(response.data || []);
                setFormData(prev => ({ ...prev, filiere: '', niveau: '', semestre: '' }));
                setNiveauOptions([]);
                setSemestreOptions([]);
            } catch (error) {
                toast.error('Erreur lors du chargement des filières');
                setFiliereOptions([]);
            } finally {
                setLoadingFilieres(false);
            }
        };
        loadFilieres();
    }, [formData.ufr]);

    useEffect(() => {
        if (!formData.ufr || !formData.filiere) {
            setNiveauOptions([]);
            setSemestreOptions([]);
            return;
        }
        const loadNiveaux = async () => {
            try {
                setLoadingNiveaux(true);
                const response = await getNiveauxByFiliere(formData.ufr, formData.filiere);
                setNiveauOptions(response.data || []);
                setFormData(prev => ({ ...prev, niveau: '', semestre: '' }));
                setSemestreOptions([]);
            } catch (error) {
                toast.error('Erreur lors du chargement des niveaux');
                setNiveauOptions([]);
            } finally {
                setLoadingNiveaux(false);
            }
        };
        loadNiveaux();
    }, [formData.ufr, formData.filiere]);

    useEffect(() => {
        if (!formData.niveau) {
            setSemestreOptions([]);
            return;
        }
        const niveau = niveauOptions.find(n => n.name === formData.niveau);
        if (niveau && Array.isArray(niveau.semestres)) {
            setSemestreOptions(niveau.semestres.map(s => ({ value: s, label: s })));
        }
    }, [formData.niveau, niveauOptions]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.ufr || !formData.filiere || !formData.niveau || !formData.semestre || !formData.matiere.trim()) {
            toast.error('Veuillez remplir les champs obligatoires (*)');
            return;
        }

        try {
            setSubmitting(true);
            const response = await createExamRequest(formData);
            toast.success('Demande publiée avec succès');
            onCreated?.(response.request);
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur lors de la création de la demande';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Demander un examen à vos camarades</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Building2 size={16} />
                                UFR *
                            </label>
                            <select
                                name="ufr"
                                value={formData.ufr}
                                onChange={handleChange}
                                disabled={loadingUfrs}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                <option value="">Sélectionner une UFR</option>
                                {ufrOptions.map(option => (
                                    <option key={option.name} value={option.name}>{option.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <GraduationCap size={16} />
                                Filière *
                            </label>
                            <select
                                name="filiere"
                                value={formData.filiere}
                                onChange={handleChange}
                                disabled={loadingFilieres || !formData.ufr}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                <option value="">Sélectionner une filière</option>
                                {filiereOptions.map(option => (
                                    <option key={option.name} value={option.name}>{option.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <GraduationCap size={16} />
                                Niveau *
                            </label>
                            <select
                                name="niveau"
                                value={formData.niveau}
                                onChange={handleChange}
                                disabled={loadingNiveaux || !formData.filiere}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                <option value="">Sélectionner un niveau</option>
                                {niveauOptions.map(option => (
                                    <option key={option.name} value={option.name}>{option.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} />
                                Semestre *
                            </label>
                            <select
                                name="semestre"
                                value={formData.semestre}
                                onChange={handleChange}
                                disabled={!formData.niveau}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                <option value="">Sélectionner un semestre</option>
                                {semestreOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <BookOpen size={16} />
                                Matière *
                            </label>
                            <input
                                type="text"
                                name="matiere"
                                value={formData.matiere}
                                onChange={handleChange}
                                placeholder="Ex: Algorithmique"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FileText size={16} />
                                Type d'examen
                            </label>
                            <select
                                name="typeExamen"
                                value={formData.typeExamen}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {TYPE_EXAMEN_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Calendar size={16} />
                                Année visée
                            </label>
                            <input
                                type="number"
                                name="anneeExamen"
                                value={formData.anneeExamen}
                                onChange={handleChange}
                                placeholder="Ex: 2024"
                                min="2000"
                                max="2100"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Précisions (optionnel)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            maxLength={1000}
                            placeholder="Ajoutez des précisions pour aider la communauté à retrouver l'examen recherché..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            Publier la demande
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
