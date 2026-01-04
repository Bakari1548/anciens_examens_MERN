import sheet1 from '@/assets/sheet1.png';
import sheet2 from '@/assets/sheet2.png';
import sheet3 from '@/assets/sheet3.png';
import sheet4 from '@/assets/sheet4.png';
import sheet5 from '@/assets/sheet5.png';
import sheet6 from '@/assets/sheet6.png';

export default function HeroSection() {
  return (
    <div className="flex flex-row bg-radial-[at_50%_50%] from-gray-50 via-gray-400/50 to-gray-100 to-90% w-full py-14 pb-48 justify-center items-center mx-auto p-4 md:px-4 px-6">
        {/* <p className="text-xl font-normal text-center my-6">Vous êtes connecté en tant que <span className="font-semibold">{{ user|get_first_letter_user }}</span></p> {% endcomment %} */}
        {/* <p className="text-xl font-bold text-center my-6">Veuillez vous connecter pour continuer</p> */}
        <div className="relative md:block hidden h-60 w-1/4 ">
            <h2 className="absolute top-0 left-[35%] font-bold text-2xl text-gray-400/60 -rotate-25">LMI</h2>
            <h2 className="absolute top-24 left-[25%] font-bold text-2xl text-gray-400/70 rotate-10">LGI</h2>
            <h2 className="absolute top-36 left-[75%] font-bold text-2xl text-gray-400/70 rotate-15">LSEE</h2>
            <h2 className="absolute top-68 left-[30%] font-bold text-2xl text-gray-500/70 -rotate-80">LPC</h2>
            <img
                src={sheet6}
                className="absolute top-16 left-[65%] rotate-20 w-12 h-12 opacity-40"
            />
            <img 
                src={sheet4}
                className="absolute top-44 left-[30%] -rotate-25 w-12 h-12 opacity-30"
            />
            <img 
                src={sheet3}
                className="absolute top-60 left-[85%] rotate-35 w-12 h-12 opacity-40"
            />
        </div>
        <div className="flex flex-col items-center gap-8 md:px-0 sm:px-14 px-4 sm:pt-0 pt-20">
            <h1 className="text-4xl text-gray-800 font-medium text-center">
                Bienvenue dans
                <span className="bg-linear-to-r from-violet-500 via-green-400 to-blue-600 bg-clip-text font-semibold text-transparent"> anciens examens</span>
            </h1>
            <p className="text-gray-800 font-medium text-center text-lg">Une plateforme qui collecte les anciens examens de l'UIDT pour vous aider à mieux reviser.</p>
            <div className="flex flex-col min-[520px]:flex-row gap-4 justify-center items-center">
                <a href="#" className="bg-gray-500 text-white py-3 px-4 rounded-lg shadow hover:bg-gray-700 active:scale-95 transition-all duration-300 ease-in-out">
                    Consulter les Examens
                </a>
                <a href="#" className="border border-gray-700 text-gray-800 py-3 px-4 rounded-lg shadow hover:bg-gray-300/80 hover:shadow active:scale-95 transition-all duration-300 ease-in-out">
                    Partager un examen
                </a>
            </div>
        </div>
        <div className="relative md:block hidden h-60 w-1/4 ">
            <h2 className="absolute top-0 right-[35%] font-bold text-2xl text-gray-400/60 -rotate-25">LEA</h2>
            <h2 className="absolute -top-4 right-[85%] font-bold text-2xl text-gray-400/70 -rotate-50">MTH</h2>
            <h2 className="absolute top-28 right-[25%] font-bold text-2xl text-gray-400/70 -rotate-10">SEG</h2>
            <h2 className="absolute top-36 right-[75%] font-bold text-2xl text-gray-400/70 -rotate-15">LAC</h2>
            <h2 className="absolute top-68 right-[40%] font-bold text-2xl text-gray-500/70 rotate-40">MIO</h2>
            <img 
                src={sheet1}
                className="absolute top-16 right-[65%] rotate-20 w-12 h-12 opacity-40"
            />
            <img 
                src={sheet2}
                className="absolute top-52 right-[35%] -rotate-35 w-12 h-12 opacity-30"
            />
            <img 
                src={sheet5}
                className="absolute top-60 right-[85%] rotate-35 w-12 h-12 opacity-40"
            />
        </div>
    </div>
  )
}