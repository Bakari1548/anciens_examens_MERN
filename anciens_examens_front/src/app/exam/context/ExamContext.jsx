import { createContext, useContext, useState } from "react";


export const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({ filiere: "", semestre: "", matiere: "" });

    const value = { 
        searchQuery, 
        setSearchQuery, 
        filters, 
        setFilters 
    };

    return (
        <ExamContext.Provider value={value}>
            {children}
        </ExamContext.Provider>
    );
}

export const useExamContext = () => useContext(ExamContext);