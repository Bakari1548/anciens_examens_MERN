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
        const { title, ufr, filiere, matiere, year } = req.body;
        const author = req.user._id;
        
        if (!title || !ufr || !filiere || !matiere || !year || !author) {
            return res.status(400).json({
                message: 'Tous les champs sont requis'
            });
        }

        // Générer le slug à partir du titre
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        const exam = await Exam.create({
            title,
            slug,
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
        const exam = await Exam.findOne({ slug: req.params.slug });
        
        if(!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé'
            });
        };
        
        const updatedExam = await Exam.findByIdAndUpdate(exam._id, req.body, {
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
        const exam = await Exam.findOne({ slug: req.params.slug });
        if (!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé'
            });
        };
        await Exam.findByIdAndDelete(exam._id);
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
