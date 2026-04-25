import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { postNewExam } from '../services/exam.api';
import studentImage1 from '@/assets/post_exam.webp';
import studentImage2 from '@/assets/student6.webp';
import studentImage3 from '@/assets/student2.webp';

export default function PostExam() {
    const [formData, setFormData] = useState({
        title: '',
        year: '',
        ufr: '',
        filiere: '',
        matiere: '',
        description: '',
        file: null
    });
    const [loading, setLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const slides = [
        {
            image: studentImage1,
            title: "Contribuez à la communauté",
            description: "En partageant vos examens, vous aidez d'autres étudiants à préparer leurs évaluations et à réussir leurs études."
        },
        {
            image: studentImage2,
            title: "Ensemble, on réussit mieux",
            description: "La collaboration est la clé du succès. Partagez vos connaissances et recevez de l'aide en retour."
        },
        {
            image: studentImage3,
            title: "Une ressource précieuse",
            description: "Accédez à une base de données complète d'examens pour mieux vous préparer et exceller dans vos cours."
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

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
        if (!formData.title  || !formData.ufr || !formData.filiere || !formData.matiere || !formData.file) {
            toast.error('Veuillez remplir tous les champs obligatoires, y compris le fichier');
            return;
        }

        // Validation de l'année
        if (formData.year.length !== 4 && formData.year !== '') {
            toast.error('L\'année doit être un nombre de 4 chiffres');
            return;
        }

        // Validation du fichier
        if (formData.file) {
            // Vérifier le type de fichier
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(formData.file.type)) {
                toast.error('Type de fichier non supporté. Veuillez utiliser PDF, JPG, PNG ou GIF');
                return;
            }

            // Vérifier la taille (10MB max)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (formData.file.size > maxSize) {
                toast.error('Le fichier est trop volumineux. Taille maximale : 10MB');
                return;
            }
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
            examData.append('description', formData.description);
            if (formData.file) {
                examData.append('file', formData.file);
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        {/* Colonne gauche - Formulaire */}
                        <div className="lg:w-1/2 p-8 lg:p-12">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Partager un examen</h1>
                                <p className="text-gray-600">Aidez la communauté en partageant vos anciens examens</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                        Titre de l'examen *
                                    </label>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                                        placeholder="Ex: Mathématiques - Analyse I - Session Janvier 2024"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                                        Année
                                    </label>
                                    <input 
                                        type="text" 
                                        name="year" 
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                                        placeholder="Ex: 2024"
                                        maxLength={4}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="ufr" className="block text-sm font-medium text-gray-700 mb-2">
                                            UFR *
                                        </label>
                                        <select 
                                            name="ufr" 
                                            value={formData.ufr}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        >
                                            <option value="">Sélectionnez une UFR</option>
                                            <option value="UFR Sciences et Technologies">UFR Sciences et Technologies</option>
                                            <option value="UFR Sciences Économiques et de Gestion">UFR Sciences Économiques et de Gestion</option>
                                            <option value="UFR Lettres, Arts et Communication">UFR Lettres, Arts et Communication</option>
                                            <option value="UFR Sciences Juridiques et Politiques">UFR Sciences Juridiques et Politiques</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="filiere" className="block text-sm font-medium text-gray-700 mb-2">
                                            Filière *
                                        </label>
                                        <select 
                                            name="filiere" 
                                            value={formData.filiere}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        >
                                            <option value="">Sélectionnez une filière</option>
                                            <option value="L1">Licence 1</option>
                                            <option value="L2">Licence 2</option>
                                            <option value="L3">Licence 3</option>
                                            <option value="M1">Master 1</option>
                                            <option value="M2">Master 2</option>
                                        </select>
                                    </div>
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

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                        rows={3}
                                        placeholder="Description de l'examen (facultatif)..."
                                    />
                                </div>

                                <div>
                                    <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                                        Fichier (PDF ou image) *
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            name="file" 
                                            onChange={handleChange}
                                            accept=".pdf,.jpg,.jpeg,.png,.gif"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:cursor-pointer hover:file:bg-blue-100"
                                            required
                                        />
                                    </div>
                                    {formData.file && (
                                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-sm text-green-700 font-medium">
                                                ✓ Fichier sélectionné : {formData.file.name}
                                            </p>
                                            <p className="text-xs text-green-600 mt-1">
                                                Taille : {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">
                                        Formats acceptés : PDF, JPG, PNG, GIF (max 10MB)
                                    </p>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                                            <span>Partager l'examen</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Colonne droite - Carrousel */}
                        <div className="lg:w-1/2 bg-gradient-to-br from-blue-300 to-blue-600 p-8 lg:p-12 flex items-center justify-center relative overflow-hidden">
                            <div className="text-center w-full">
                                <div className="relative">
                                    <img
                                        src={slides[currentSlide].image}
                                        alt={slides[currentSlide].title}
                                        className="w-full max-w-md mx-auto h-[450px] object-cover rounded-2xl shadow-2xl transition-opacity duration-500"
                                        key={currentSlide}
                                    />
                                </div>
                                <div className="mt-8 text-white">
                                    <h3 className="text-2xl font-bold mb-3">{slides[currentSlide].title}</h3>
                                    <p className="text-blue-100 text-lg leading-relaxed">
                                        {slides[currentSlide].description}
                                    </p>
                                </div>
                                
                                {/* Indicateurs du carrousel */}
                                <div className="flex justify-center gap-2 mt-6">
                                    {slides.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                index === currentSlide 
                                                    ? 'bg-white scale-125' 
                                                    : 'bg-white/50 hover:bg-white/70'
                                            }`}
                                        />
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