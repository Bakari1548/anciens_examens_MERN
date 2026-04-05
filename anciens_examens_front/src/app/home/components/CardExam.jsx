import logoFile from '@/assets/file_exam.png';
import { Download, Eye } from 'lucide-react';

export default function CardExam({ exam }) {

    return (
        <div className="bg-white w-full shadow flex sm:flex-row flex-col sm:justify-start justify-center items-center border border-gray-200 rounded-lg py-3 px-4 gap-4">
            <img 
                className="sm:w-48 opacity-70 w-60 sm:mx-0 mx-auto" 
                src={logoFile} 
            />
            <div className="flex flex-col gap-3 mt-3 w-full">
                <h3 className="font-semibold text-lg text-gray-800">{exam.title}</h3>
                <div className="flex flex-col justify-start items-start gap-2 mt-4">
                    <p className="text-md"><span className="font-semibold">UFR :</span> {exam.ufr}</p>
                    <p className="text-md"><span className="font-semibold">Filière :</span> {exam.filiere}</p>
                    <p className="text-md"><span className="font-semibold">Matiere :</span> {exam.matiere}</p>
                    {exam.year ? (
                        <p className="text-md"><span className="font-semibold">Année :</span> {exam.year}</p>
                    ) : (
                        <p className="text-md"><span className="font-semibold">Année :</span> non précisée</p>
                    )}
                    <p className="text-md"><span className="font-semibold">Publié par :</span> {exam.author}</p>
                </div>
                <div className="flex min-[550px]:flex-row flex-col gap-6 w-full">
                    <a 
                        href={`examen/${exam.id}`}
                        className="bg-blue-400/40 flex justify-center gap-2 text-black   items-center p-2 min-[550px]:w-1/2 font-semibold rounded-lg shadow active:scale-95 hover:bg-blue-400 active:bg-blue-400 transition-all duration-200 ease-in-out"
                    >
                        <span>Lire</span>
                        <Eye size={18} />
                    </a>
                    <a
                        download
                        href={exam.file.url} 
                        className="bg-transparent flex justify-center items-center gap-2 border border-gray-300 text-black   p-2 min-[550px]:w-1/2 text-center font-semibold rounded-lg shadow active:scale-95 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 ease-in-out"
                    >
                        <span>Télécharger</span>
                        <Download size={20} />
                    </a>
                </div>
            </div>
        </div>
    )
}