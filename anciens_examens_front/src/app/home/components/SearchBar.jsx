import { useState } from "react";
import { mockFilieres } from "../services/mockDatas";
import { useExamContext } from "../context/ExamContext";


export default function SearchBar() {

    const [filiereSelected, setFiliereSelected] = useState("");
    const [semestreSelected, setSemestreSelected] = useState("");
    // const [matiereSelected, setMatiereSelected] = useState("");

    const { searchQuery, setSearchQuery, filters, setFilters } = useExamContext();

    const handleResetFilters = () => {
        setFiliereSelected("");
        setSemestreSelected("");
        // setMatiereSelected("");
    };
    
    return (
        <div className="flex flex-col gap-5 sm:px-10 px-4 w-full my-10">
            <div className="relative flex md:w-2/3 w-full sm:mx-auto ">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='🔎 Rechercher un examen par son titre'
                    className="w-full shadow-sm bg-white px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                {searchQuery !=="" &&
                <button
                    onClick={() => setSearchQuery("")}
                    className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 bg-gray-500 text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 active:scale-95 transition"
                >
                    Reinitialiser
                </button>
                }
            </div>
            <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 px-4 py-2.5 bg-white justify-center gap-5 shadow-sm rounded-md w-full items-center">
                <select 
                    className="bg-gray-100/70 border active:outline-gray-500 focus:outline-gray-500 rounded-md py-2 px-4"
                    name="filiere" 
                    id="filiere"
                    value={filiereSelected}
                    onChange={(e) => setFiliereSelected(e.target.value)}
                >
                    <option value="all">Filtrer par filiere</option>
                    {Object.keys(mockFilieres).map((filiere, index) => (
                        <option key={index} value={filiere}>{filiere}</option>
                    ))}
                </select>
                <select 
                    disabled={filiereSelected === "" || filiereSelected === "all"}
                    className={`${filiereSelected === "" || filiereSelected === "all" ? "opacity-40 border-gray-400 cursor-not-allowed" : ""} bg-gray-100/70 border active:outline-gray-500 focus:outline-gray-500 rounded-md py-2 px-4`}
                    name="semestre" 
                    id="semestre"
                    // disabled
                    value={semestreSelected}
                    onChange={(e) => setSemestreSelected(e.target.value)}
                >
                    <option value="all">Filtrer par semestre</option>
                    {filiereSelected !== "" && filiereSelected !== "all" && Object.keys(mockFilieres[filiereSelected])?.map((semestre, index) => (
                        <option key={index} value={semestre}>{semestre}</option>
                    ))}
                </select>
                <select 
                    disabled={semestreSelected === "" || semestreSelected === "all" || filiereSelected === "" || filiereSelected === "all"}
                    className={`${semestreSelected === "" || semestreSelected === "all" || filiereSelected === "" || filiereSelected === "all" ? "opacity-40 border-gray-400 cursor-not-allowed" : ""} bg-gray-100/70 border active:outline-gray-500 focus:outline-gray-500 rounded-md py-2 px-4`}
                    name="matiere" 
                    id="matiere"
                >
                    <option value="">Filtrer par matiere</option>
                    {filiereSelected !== "" && filiereSelected !== "all" && semestreSelected !== "" && semestreSelected !== "all" && mockFilieres[filiereSelected][semestreSelected]?.map((matiere, index) => (
                        <option key={index} value={matiere}>{matiere}</option>
                    ))}
                </select>
                <button
                    onClick={handleResetFilters}
                    className="cursor-pointer h-fit bg-gray-500 text-white font-semibold px-4 py-2 rounded-md text-center gap-2 hover:bg-gray-600 active:scale-95 transition"
                >
                    Reinitialiser
                </button>
            </div>
        </div>
    )
}