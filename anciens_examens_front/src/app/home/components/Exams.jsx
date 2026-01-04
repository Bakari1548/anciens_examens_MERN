import { ChevronLeft, ChevronRight } from "lucide-react";
import { mockExams } from "../services/mockDatas";
import CardExam from "./CardExam";
import { useExamContext } from "../context/ExamContext";


export default function Exams() {

    const { searchQuery, filters } = useExamContext();

    const filteredExams = mockExams.filter((exam) => {
        const matchesSearchQuery = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFiliere = filters.filiere === "" || exam.filiere === filters.filiere;
        const matchesSemestre = filters.semestre === "" || exam.semestre === filters.semestre;
        const matchesMatiere = filters.matiere === "" || exam.matiere === filters.matiere;

        return matchesSearchQuery && matchesFiliere && matchesSemestre && matchesMatiere;
    });

    return (
        <div className="p-4 sm:px-12 px-6 flex flex-col gap-3">
            <h4 className="text-lg font-medium text-gray-700">Total produits {mockExams.length}</h4>
            {/* <p className="text-center text-xl font-medium text-gray-600">
                Désolé, nous n'avons que des examens de 2010 jusqu'à aujourd'hui
            </p> */}
            <div className="grid lg:grid-cols-2 grid-cols-1 sm:gap-4 gap-8">
                {filteredExams.map((exam) => (
                    <CardExam key={exam.id} exam={exam} />
                ))}
            </div>
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