import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAllExams } from "../../exam/services/exam.api";
import CardExam from "../../exam/components/CardExam";
import { useExamContext } from "../../exam/context/ExamContext";
import { toast } from "sonner";


export default function Exams() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const { searchQuery, filters } = useExamContext();

    useEffect(() => {
        const fetchExams = async () => {
            try {
                setLoading(true);
                const response = await getAllExams();
                setExams(response.exams || []);
            } catch (error) {
                console.error('Erreur lors de la récupération des examens:', error);
                toast.error('Erreur lors du chargement des examens');
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, []);

    const filteredExams = exams.filter((exam) => {
        const matchesSearchQuery = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFiliere = filters.filiere === "" || exam.filiere === filters.filiere;
        const matchesSemestre = filters.semestre === "" || exam.semestre === filters.semestre;
        const matchesMatiere = filters.matiere === "" || exam.matiere === filters.matiere;

        return matchesSearchQuery && matchesFiliere && matchesSemestre && matchesMatiere;
    });

    if (loading) {
        return (
            <div className="p-4 sm:px-12 px-6 flex flex-col gap-3">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
                    <p className="mt-4 text-gray-600">Chargement des examens...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:px-12 px-6 flex flex-col gap-3">
            <h4 className="text-lg font-medium text-gray-700">Total examens {exams.length}</h4>
            {filteredExams.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">Aucun examen trouvé pour vos critères de recherche.</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 grid-cols-1 sm:gap-4 gap-8">
                    {filteredExams.map((exam) => (
                        <CardExam key={exam._id} exam={exam} />
                    ))}
                </div>
            )}
            <div className="flex sm:justify-end justify-center items-center gap-3 sm:px-10 py-6">
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                    <ChevronLeft size={20} />
                </button>
                <button className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">1</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">2</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">3</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                    <ChevronRight size={20} />
                </button>
            </div>
            {/* <a href="{% url 'home'%}" className="bg-gray-500 text-white text-center py-3 px-4 rounded-lg shadow hover:bg-gray-600 active:bg-gray-600 mt-10 w-fit transition-all duration-300 ease-in-out">
                <span>Voir tous les examens</span>
                <i className="fa-solid fa-arrow-right"></i>
            </a> */}
        </div>
    )
}