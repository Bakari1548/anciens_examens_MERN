const Exam = require('../models/Exam');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// @desc    Récupérer tous les examens avec pagination et filtres
// @route   GET /api/exams
// @access  Public
const getAllExams = async (req, res) => {
    try {
        // Paramètres de pagination avec valeurs par défaut
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Paramètres de tri
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        
        // Filtres optionnels
        const filters = {};
        if (req.query.filiere) filters.filiere = req.query.filiere;
        if (req.query.ufr) filters.ufr = req.query.ufr;
        if (req.query.matiere) filters.matiere = req.query.matiere;
        if (req.query.year) filters.year = parseInt(req.query.year);
        
        // Recherche textuelle
        if (req.query.search) {
            filters.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { matiere: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        // Exécuter la requête avec pagination
        const exams = await Exam.find(filters)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);
        
        // Compter le total de documents pour la pagination
        const total = await Exam.countDocuments(filters);
        
        // Calculer les informations de pagination
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        res.status(200).json({
            message: 'Examens récupérés avec succès',
            exams,
            pagination: {
                currentPage: page,
                totalPages,
                total,
                limit,
                hasNextPage,
                hasPrevPage,
                nextPage: hasNextPage ? page + 1 : null,
                prevPage: hasPrevPage ? page - 1 : null
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
}

// @desc    Récupérer un examen par son slug
// @route   GET /api/exams/:slug
// @access  Public
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


// @desc    Récupérer les examens d'un utilisateur
// @route   GET /api/exams/user
// @access  Private
const getUserExams = async (req, res) => {
    try {
        const exams = await Exam.find({ 'author._id': req.user._id });
        // console.log('exams trouvés:', exams);
        // console.log('nombre d\'examens:', exams.length);
        if (!exams || exams.length === 0) { 
            return res.status(404).json({
                message: 'Aucun examen trouvé'
            });
        }
        // Pagination 
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const total = await Exam.countDocuments({ 'author._id': req.user._id });
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        res.status(200).json({
            message: 'Examens récupérés avec succès',
            exams,
            pagination: {
                currentPage: page,
                totalPages,
                total,
                limit,
                hasNextPage,
                hasPrevPage,
                nextPage: hasNextPage ? page + 1 : null,
                prevPage: hasPrevPage ? page - 1 : null
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Créer un examen
// @route   POST /api/exams
// @access  Private
const postExam = async (req, res) => {
    try {
       
        const { title, ufr, filiere, matiere, year } = req.body;
        const author = {
            _id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName
        };
        
        if (!title || !ufr || !filiere || !matiere || !author) {
            return res.status(400).json({
                message: 'Tous les champs sont requis',
                missing: {
                    title: !title,
                    ufr: !ufr,
                    filiere: !filiere,
                    matiere: !matiere,
                    // year: !year,
                    author: !author
                }
            });
        }

        // Vérifier si un fichier a été uploadé
        if (!req.file) {
            return res.status(400).json({
                message: 'Un fichier est requis pour créer un examen'
            });
        }

        // Générer le slug à partir du titre en y ajoutant des caractères aléatoires

        // Supprimer les caractères spéciaux et les espaces du titre
        const slugTitle = title.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, ' ').toLowerCase().trim();

        // Générer une chaîne aléatoire de 5 caractères
        const randomString = Math.random().toString(36).substr(2, 5);

        // Construire le slug en combinant le titre modifié et la chaîne aléatoire
        const slug = `${slugTitle.replace(/ /g, '-')}-${randomString}`;

        // Récupérer les informations du fichier uploadé sur Cloudinary
        const filePath = req.file.path; // URL Cloudinary
        const originalName = req.file.originalname;
        const fileSize = req.file.size;
        const mimeType = req.file.mimetype;

        const exam = await Exam.create({
            title,
            slug,
            ufr,
            filiere,
            matiere,
            year,
            author,
            filePath, // URL du fichier sur Cloudinary
            originalName,
            fileSize,
            mimeType,
            cloudinaryPublicId: req.file.public_id || null // ID public Cloudinary pour suppression future
        });

        // Ajouter l'ID de l'examen au tableau exams de l'utilisateur
        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { exams: exam._id } },
            { new: true }
        );

        res.status(201).json({
            message: 'Examen créé avec succès',
            exam: {
                ...exam.toObject(),
                fileUrl: filePath // URL pour le frontend
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
}

// @desc    Mettre à jour un examen
// @route   PUT /api/exams/:slug
// @access  Private
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

// @desc    Supprimer un examen
// @route   DELETE /api/exams/:id
// @access  Private
const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findOne({ slug: req.params.slug });
        if (!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé'
            });
        };

        // Supprimer le fichier de Cloudinary
        if (exam.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(exam.cloudinaryPublicId, {
                resource_type: 'auto' // Supprimer images et PDF
            });
        }

        // Supprimer l'examen de la base de données
        await Exam.findByIdAndDelete(exam._id);
        
        res.status(200).json({
            message: 'Examen supprimé avec succès'
        });
    } catch (error) {
        console.log('Erreur lors de la suppression:', error);
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
}

module.exports = {
    getAllExams,
    getExamBySlug,
    getUserExams,
    postExam,
    updateExam,
    deleteExam
};
