import studentExample from '@/assets/student1.webp'
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'
import { tokenStorage } from '../../../utils/tokenStorage';
import { useTheme } from '@/app/admin/context/ThemeContext';

export default function CTASection() {
    const { isDark } = useTheme();
    const navigate = useNavigate();

    // Vérifier si l'utilisateur est connecté et gérer la redirection
    const handleShareExam = () => {
        const user = tokenStorage.getUser();
        if (user) {
            // Utilisateur connecté, rediriger directement vers la page de partage
            navigate('/partager-examen');
        } else {
            // Utilisateur non connecté, stocker la destination et rediriger vers login
            localStorage.setItem('redirectAfterLogin', '/partager-examen');
            navigate('/connexion');
        }
    };


  return (
    <div className={`pt-16 pb-20 border-t border-gray-200 px-6 md:px-12 flex md:flex-row flex-col gap-8 items-center bg-gray-50`}>
        <div className={`p-6 rounded-lg md:w-1/2 bg-gray-50`}>
            <h2 className={`text-4xl font-bold mb-10`}>Vous êtes étudiant(e) ou enseignant(e) ?</h2>
            <p className={`mb-6 text-lg`}>Contribuez à la communauté en partageant vos anciens examens pour aider les étudiants à préparer leurs examens.</p>
            <button
                onClick={handleShareExam}
                className="flex items-center gap-3 bg-gray-500 text-white px-6 py-4 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
                <span>Partager un examen</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
        <img
            className=" md:w-1/2 object-cover rounded-lg"
            src={studentExample}
            alt="Étudiants heureux"
        />
    </div>
  );
}