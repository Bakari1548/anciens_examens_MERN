const Exam = require('../models/Exam');


const getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find();
        res.status(200).json({
            message: 'Examens récupérés avec succès',
            exams
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
}

const getExamBySlug = async (req, res) => {
    try {
        const exam = await Exam.findOne({ slug: req.params.slug });
        if (!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé'
            });
        }

        res.status(200).json({
            message: 'Examen récupéré avec succès',
            exam
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
}

const postExam = async (req, res) => {
    try {
        const { title, ufr, filiere, matiere, year, author } = req.body;
        // console.log(req.user);
        author = req.user;
        
        if (!title || !ufr || !filiere || !matiere || !year || !author) {
            return res.status(400).json({
                message: 'Tous les champs sont requis'
            });
        }

        const exam = await Exam.create({
            title,
            ufr,
            filiere,
            matiere,
            year,
            author
        });
        res.status(201).json({
            message: 'Examen créé avec succès',
            exam
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
}

const updateExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        
        if(!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé'
            });
        }
        
        const updatedExam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        res.status(200).json({
            message: 'Examen mis à jour avec succès',
            updatedExam
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
}

const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);
        if (!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé'
            });
        }
        res.status(200).json({
            message: 'Examen supprimé avec succès'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
}

module.exports = {
    getAllExams,
    getExamBySlug,
    postExam,
    updateExam,
    deleteExam
};
