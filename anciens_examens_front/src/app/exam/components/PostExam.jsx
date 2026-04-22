import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { postNewExam } from '../services/exam.api';
import studentImage from '@/assets/student6.webp';

export default function PostExam() {
    const [formData, setFormData] = useState({
        title: '',
        year: '',
        ufr: '',
        filiere: '',
        matiere: '',
        file: null
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'file') {
            setFormData(prev => ({
                ...prev,
                file: files[0] || null
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.title || !formData.year || !formData.ufr || !formData.filiere || !formData.matiere) {
            toast.error('Veuillez remplir tous les champs obligatoires');
            return;
        }

        // Validation de l'année
        if (formData.year.length !== 4 || isNaN(formData.year)) {
            toast.error('L\'année doit être un nombre de 4 chiffres');
            return;
        }

        try {
            setLoading(true);
            
            // Créer FormData pour l'upload de fichier
            const examData = new FormData();
            examData.append('title', formData.title);
            examData.append('year', formData.year);
            examData.append('ufr', formData.ufr);
            examData.append('filiere', formData.filiere);
            examData.append('matiere', formData.matiere);
            if (formData.file) {
                examData.append('file', formData.file);
            }

            const response = await postNewExam(examData);
            
            toast.success('Examen partagé avec succès !');
            
            // Rediriger vers la page de détails de l'examen
            setTimeout(() => {
                navigate(`/examen/${response.exam.slug}`);
            }, 2000);
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors du partage de l\'examen';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full py-10 px-12">
            <div className="w-1/2">
                <h2 className="text-3xl font-bold pb-6">Partager un examen</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data" className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <label htmlFor="title">Titre</label>
                        <input 
                            type="text" 
                            name="title" 
                            value={formData.title}
                            onChange={handleChange}
                            className="p-3 rounded-lg border border-gray-600 font-semibold" 
                            placeholder="Ex: Mathématiques - Analyse I - Session Janvier 2024"
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label htmlFor="year">Année</label>
                        <input 
                            type="text" 
                            name="year" 
                            value={formData.year}
                            onChange={handleChange}
                            className="p-3 rounded-lg border border-gray-600 font-semibold" 
                            placeholder="Ex: 2024"
                            maxLength={4}
                        />
                    </div>
                    <div className="flex flex-row gap-5">
                        <div className="flex flex-col gap-3 sm:w-1/2">
                            <label htmlFor="ufr">UFR</label>
                            <select 
                                name="ufr" 
                                value={formData.ufr}
                                onChange={handleChange}
                                className="p-3 rounded-lg border border-gray-600 font-semibold"
                            >
                                <option value="">Sélectionnez une UFR</option>
                                <option value="UFR Sciences et Technologies">UFR Sciences et Technologies</option>
                                <option value="UFR Sciences Économiques et de Gestion">UFR Sciences Économiques et de Gestion</option>
                                <option value="UFR Lettres, Arts et Communication">UFR Lettres, Arts et Communication</option>
                                <option value="UFR Sciences Juridiques et Politiques">UFR Sciences Juridiques et Politiques</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-3 sm:w-1/2">
                            <label htmlFor="filiere">Filière</label>
                            <select 
                                name="filiere" 
                                value={formData.filiere}
                                onChange={handleChange}
                                className="p-3 rounded-lg border border-gray-600 font-semibold"
                            >
                                <option value="">Sélectionnez une filière</option>
                                <option value="L1">Licence 1</option>
                                <option value="L2">Licence 2</option>
                                <option value="L3">Licence 3</option>
                                <option value="M1">Master 1</option>
                                <option value="M2">Master 2</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-3 sm:w-1/2">
                            <label htmlFor="matiere">Matière</label>
                            <input 
                                type="text" 
                                name="matiere" 
                                value={formData.matiere}
                                onChange={handleChange}
                                className="p-3 rounded-lg border border-gray-600 font-semibold" 
                                placeholder="Ex: Mathématiques"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <label htmlFor="file">Fichier (optionnel)</label>
                        <input 
                            type="file" 
                            name="file" 
                            onChange={handleChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="p-3 rounded-lg border border-gray-400 bg-gray-100 font-semibold" 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-gray-600 font-semibold text-white w-fit py-3 px-12 rounded-lg shadow hover:bg-gray-700 active:bg-gray-700 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Ajout en cours...' : 'Ajouter'}
                    </button>
                </form>
            </div>
            {/* <img
                class="md:h-[600px] rounded-lg h-full object-cover"
                src={studentImage}
                alt="Partager un examen"
            /> */}
        </div>
    );
}