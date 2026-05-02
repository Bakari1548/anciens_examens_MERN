import studentExample from '@/assets/student1.webp'
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'

export default function CTASection() {
    const navigate = useNavigate();


  return (
    <div className="pt-10 mt-6 border-t border-gray-300 pb-20 px-6 md:px-12 flex md:flex-row flex-col gap-8 items-center">
        <div className="p-6 rounded-lg md:w-1/2">
            <h2 className="text-4xl font-bold mb-10 text-gray-700">Vous êtes étudiant(e) ou enseignant(e) ?</h2>
            <p className="mb-6 text-lg">Contribuez à la communauté en partageant vos anciens examens pour aider les étudiants à préparer leurs examens.</p>
            <button
                onClick={() => navigate('/partager-examen')}
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