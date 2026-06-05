import sheet1 from '@/assets/sheet1.png';
import sheet2 from '@/assets/sheet2.png';
import sheet3 from '@/assets/sheet3.png';
import sheet4 from '@/assets/sheet4.png';
import sheet5 from '@/assets/sheet5.png';
import sheet6 from '@/assets/sheet6.png';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '@/utils/tokenStorage';
import { useTheme } from '@/app/admin/context/ThemeContext';

export default function HeroSection() {
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
    <div className={`flex flex-row bg-radial-[at_50%_50%] ${isDark ? 'from-black/85 via-black/70 to-black/85' : 'from-gray-50 via-gray-400/50 to-gray-100'} to-90% w-full py-14 pb-48 justify-center items-center mx-auto p-4 md:px-4 px-6`}>
      <style>{`
        @keyframes float-up-down {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float-animation {
          animation: float-up-down 6s ease-in-out infinite;
        }
        .float-animation-delay-1 {
          animation: float-up-down 6s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        .float-animation-delay-2 {
          animation: float-up-down 6s ease-in-out infinite;
          animation-delay: 1s;
        }
        .float-animation-delay-3 {
          animation: float-up-down 6s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        .float-animation-delay-4 {
          animation: float-up-down 6s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
        <div className="relative md:block hidden h-60 w-1/4 ">
            <h2 className="absolute top-0 left-[35%] font-bold text-2xl text-gray-400/60 -rotate-25 float-animation">LMI</h2>
            <h2 className="absolute top-24 left-[25%] font-bold text-2xl text-gray-400/70 rotate-10 float-animation-delay-1">LGI</h2>
            <h2 className="absolute top-36 left-[75%] font-bold text-2xl text-gray-400/70 rotate-15 float-animation-delay-2">LSEE</h2>
            <h2 className="absolute top-68 left-[30%] font-bold text-2xl text-gray-400/70 -rotate-80 float-animation-delay-3">LPC</h2>
            <h2 className="absolute top-68 left-[60%] font-bold text-2xl text-gray-500/70 -rotate-30 float-animation-delay-3">SET</h2>
            <img
                src={sheet6}
                className="absolute top-16 left-[65%] rotate-20 w-14 h-14 opacity-40 float-animation-delay-2"
            />
            <img 
                src={sheet4}
                className="absolute top-44 left-[30%] -rotate-25 w-14 h-14 opacity-30 float-animation-delay-4"
            />
            <img 
                src={sheet3}
                className="absolute top-60 left-[85%] rotate-35 w-14 h-14 opacity-40 float-animation-delay-1"
            />
        </div>
        <div className="flex flex-col items-center gap-8 md:px-0 sm:px-14 px-4 sm:pt-0 pt-20">
            <h1 className={`text-5xl font-medium text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Bienvenue dans
                <span className="bg-linear-to-r from-violet-500 via-green-400 to-blue-600 bg-clip-text font-semibold text-transparent"> anciens examens</span>
            </h1>
            <p className={`font-medium text-center text-lg ${isDark ? 'text-gray-600' : 'text-gray-800'}`}>Une plateforme qui collecte les anciens examens de l'UIDT pour vous aider à mieux reviser.</p>
            <div className="flex flex-col min-[520px]:flex-row gap-4 justify-center items-center">
                <button onClick={() => navigate('/examens')} className="font-medium bg-gray-500 text-white py-3 px-4 rounded-lg shadow hover:bg-gray-700 active:scale-95 transition-all duration-300 ease-in-out">
                    Consulter les Examens
                </button>
                <button onClick={handleShareExam} className={`font-medium border py-3 px-4 rounded-lg shadow hover:shadow active:scale-95 transition-all duration-300 ease-in-out ${isDark ? 'border-gray-600 text-white hover:bg-gray-700' : 'border-gray-700 text-gray-800 hover:bg-gray-300/80'}`}>
                    Partager un examen
                </button>
            </div>
        </div>
        <div className="relative md:block hidden h-60 w-1/4 ">
            <h2 className="absolute top-0 right-[35%] font-bold text-2xl text-gray-400/60 -rotate-25 float-animation-delay-2">LEA</h2>
            <h2 className="absolute top-0 right-[60%] font-bold text-2xl text-gray-500/60 -rotate-25 float-animation-delay-2">SES</h2>
            <h2 className="absolute -top-4 right-[85%] font-bold text-2xl text-gray-400/70 -rotate-50 float-animation">MTH</h2>
            <h2 className="absolute top-28 right-[25%] font-bold text-2xl text-gray-400/70 -rotate-10 float-animation-delay-3">SEG</h2>
            <h2 className="absolute top-44 right-[70%] font-bold text-2xl text-gray-400/70 -rotate-15 float-animation-delay-4">LAC</h2>
            <h2 className="absolute top-68 right-[40%] font-bold text-2xl text-gray-400/70 rotate-40 float-animation-delay-1">MIO</h2>
            <img 
                src={sheet1}
                className="absolute top-16 right-[65%] rotate-20 w-14 h-14 opacity-40 float-animation-delay-3"
            />
            <img 
                src={sheet2}
                className="absolute top-52 right-[35%] -rotate-35 w-14 h-14 opacity-30 float-animation-delay-1"
            />
            <img 
                src={sheet5}
                className="absolute top-60 right-[85%] rotate-35 w-14 h-14 opacity-40 float-animation-delay-4"
            />
        </div>
    </div>
  )
}