const Exam = require('../models/Exam');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const { createLog } = require('../utils/logger');
const Notification = require('../models/Notification');

// Fonction pour générer un slug unique avec caractères aléatoires
const generateUniqueSlug = async (baseSlug) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < 6; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    const slug = `${baseSlug}-${randomString}`;
    
    // Vérifier si le slug existe déjà
    const existingExam = await Exam.findOne({ slug });
    if (existingExam) {
        // Si le slug existe, régénérer avec une nouvelle chaîne aléatoire
        return generateUniqueSlug(baseSlug);
    }
    
    return slug;
};

// @desc    Récupérer tous les examens avec pagination et filtres
// @route   GET /api/exams
// @access  Public
const getAllExams = async (req, res) => {
    try {
        // Paramètres de pagination avec valeurs par défaut
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        
        // Paramètres de tri
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        
        // Filtres optionnels
        const filters = {};
        if (req.query.filiere) filters.filiere = req.query.filiere;
        if (req.query.ufr) filters.ufr = req.query.ufr;
        if (req.query.matiere) filters.matiere = { $regex: req.query.matiere, $options: 'i' };
        if (req.query.niveau) filters.niveau = req.query.niveau;
        if (req.query.semestre) filters.semestre = req.query.semestre;
        if (req.query.anneeExamen) filters.anneeExamen = req.query.anneeExamen;
        if (req.query.typeExamen) filters.typeExamen = req.query.typeExamen;
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
                message: 'Aucun examen trouvé',
                exams: []
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
       
        const { ufr, filiere, niveau, semestre, anneeExamen, typeExamen, matiere, description } = req.body;
        const author = {
            _id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName
        };
        
        if (!ufr || !filiere || !niveau || !semestre || !typeExamen || !matiere || !author) {
            return res.status(400).json({
                message: 'Tous les champs sont requis',
                missing: {
                    ufr: !ufr,
                    filiere: !filiere,
                    niveau: !niveau,
                    semestre: !semestre,
                    typeExamen: !typeExamen,
                    matiere: !matiere,
                    author: !author
                }
            });
        }

        // Vérifier si des fichiers ont été uploadés
        // console.log('Vérification des fichiers uploadés:', {
        //     files: req.files,
        //     filesLength: req.files?.length,
        //     body: req.body,
        //     headers: req.headers['content-type']
        // });
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: 'Au moins un fichier est requis pour créer un examen'
            });
        }

        // Préparer les informations des fichiers uploadés
        // console.log('Traitement de', req.files.length, 'fichiers');
        
        const files = req.files.map((file, index) => {

            let url = file.path
            
            if (file.mimetype === 'application/pdf' && url.includes('/raw/upload/')) {
                url = url.replace('/raw/upload/', '/image/upload/')
            }
            return {
                url: url, // URL Cloudinary
                publicId: file.filename || file.public_id || null, // CloudinaryStorage utilise filename
                size: file.size,
                mimeType: file.mimetype,
                originalName: file.originalname,
                order: index
            };
        });
        
        // console.log('Fichiers traités:', files.map(f => ({ name: f.originalName, type: f.mimeType, size: f.size })));

        // Générer le titre formaté et le slug unique
        const formattedTitle = `${typeExamen} ${matiere}`;
        const baseSlug = formattedTitle.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .trim();
        
        const slug = await generateUniqueSlug(baseSlug);

        const exam = await Exam.create({
            title: formattedTitle,
            slug,
            ufr,
            filiere,
            niveau,
            semestre,
            anneeExamen,
            typeExamen,
            matiere,
            description,
            author,
            files // Tableau des fichiers
        });

        // Ajouter l'ID de l'examen au tableau exams de l'utilisateur
        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { exams: exam._id } },
            { new: true }
        );

        // Envoyer une notification à l'utilisateur que son examen a été partagé
        await Notification.create({
            recipient: req.user._id,
            type: 'exam',
            title: 'Examen partagé avec succès',
            message: `Votre examen "${exam.title}" a été partagé et est en attente d'approbation.`,
            metadata: {
                examId: exam._id,
                slug: exam.slug
            },
            read: false
        });

        // Envoyer une notification aux autres utilisateurs de la même filière
        const usersInFiliere = await User.find({
            _id: { $ne: req.user._id },
            filiere: filiere,
            status: 'active'
        }).select('_id');

        for (const user of usersInFiliere) {
            await Notification.create({
                recipient: user._id,
                type: 'exam',
                title: 'Nouvel examen disponible',
                message: `Un nouvel examen "${exam.title}" est disponible dans votre filière ${filiere}.`,
                metadata: {
                    examId: exam._id,
                    slug: exam.slug,
                    filiere: filiere
                },
                read: false
            });
        }

        await createLog({ level: 'info', action: 'EXAM_UPLOAD', message: `Upload examen: ${exam.title}`, req, user: req.user, metadata: { examId: exam._id, slug: exam.slug, filesCount: files.length } });
        res.status(201).json({
            message: 'Examen créé avec succès',
            exam: {
                ...exam.toObject(),
                fileUrl: files[0]?.url || null // URL du premier fichier pour compatibilité
            }
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'examen:', error);
        await createLog({ level: 'error', action: 'EXAM_UPLOAD_FAILED', message: `Échec de l'upload d'examen: ${error.message}`, req, user: req.user });
        res.status(500).json({
            message: 'Erreur serveur lors du partage de l\'examen',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
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

        // Préparer les données de mise à jour
        const updateData = {
            ufr: req.body.ufr || exam.ufr,
            filiere: req.body.filiere || exam.filiere,
            niveau: req.body.niveau || exam.niveau,
            semestre: req.body.semestre || exam.semestre,
            anneeExamen: req.body.anneeExamen || exam.anneeExamen,
            typeExamen: req.body.typeExamen || exam.typeExamen,
            matiere: req.body.matiere || exam.matiere,
            description: req.body.description || exam.description
        };

        // Gérer les fichiers
        let files = exam.files || [];
        
        // Si de nouveaux fichiers sont uploadés
        if (req.files && req.files.length > 0) {
            const newFiles = req.files.map(file => ({
                url: file.secure_url,
                publicId: file.public_id,
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype
            }));
            
            // Fusionner les fichiers existants avec les nouveaux
            files = [...files, ...newFiles];
        }

        updateData.files = files;

        const updatedExam = await Exam.findByIdAndUpdate(exam._id, updateData, {
            new: true,
            runValidators: true
        });
        
        await createLog({ level: 'info', action: 'EXAM_UPDATED', message: `Examen mis à jour: ${updatedExam.title}`, req, user: req.user, metadata: { examId: updatedExam._id, slug: updatedExam.slug } });
        res.status(200).json({
            message: 'Examen mis à jour avec succès',
            exam: updatedExam
        });
    } catch (error) {
        await createLog({ level: 'error', action: 'SYSTEM_ERROR', message: `Erreur lors de la mise à jour de l'examen: ${error.message}`, req, user: req.user });
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
}

// @desc    Supprimer un examen
// @route   DELETE /api/exams/:slug
// @access  Private
const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findOne({ slug: req.params.slug });
        if (!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé'
            });
        }

        // Supprimer tous les fichiers de Cloudinary avec gestion d'erreurs
        if (exam.files && exam.files.length > 0) {
            for (const file of exam.files) {
                if (file.publicId) {
                    try {
                        // Nettoyer le publicId pour éviter les erreurs d'encodage
                        let cleanPublicId = file.publicId;
                        
                        // Si le publicId contient des caractères encodés, les décoder
                        if (cleanPublicId.includes('%2F')) {
                            cleanPublicId = decodeURIComponent(cleanPublicId);
                        }
                        
                        // S'assurer que le publicId ne contient que des caractères valides
                        cleanPublicId = cleanPublicId.replace(/[^a-zA-Z0-9_\-\/]/g, '');
                        
                        console.log(`Suppression du fichier Cloudinary: ${cleanPublicId} (original: ${file.publicId})`);
                        
                        // Déterminer le resource_type selon l'extension du fichier
                        const isPDF = cleanPublicId.toLowerCase().endsWith('.pdf') || 
                                     file.mimeType === 'application/pdf';
                        const resourceType = isPDF ? 'raw' : 'image';
                        
                        const result = await cloudinary.uploader.destroy(cleanPublicId, {
                            resource_type: resourceType,
                            invalidate: true
                        });
                        
                        if (result.result === 'ok') {
                            console.log(`Fichier Cloudinary supprimé avec succès: ${cleanPublicId}`);
                        } else {
                            console.log(`Fichier Cloudinary non trouvé (déjà supprimé?): ${cleanPublicId}`);
                        }
                    } catch (cloudinaryError) {
                        console.error(`Erreur suppression Cloudinary ${file.publicId}:`, cloudinaryError);
                        // Continuer même si un fichier ne peut pas être supprimé
                    }
                }
            }
        }

        // Supprimer l'examen de la base de données
        await Exam.findByIdAndDelete(exam._id);
        
        // Retirer l'ID de l'examen de la liste de l'utilisateur
        await User.findByIdAndUpdate(
            exam.author,
            { $pull: { exams: exam._id } }
        );
        
        console.log(`Examen supprimé: ${exam.title} (${exam.slug})`);
        
        await createLog({ level: 'warning', action: 'EXAM_DELETED', message: `Examen supprimé: ${exam.title}`, req, user: req.user, metadata: { examId: exam._id, slug: exam.slug } });
        res.status(200).json({
            message: 'Examen supprimé avec succès',
            examId: exam._id,
            slug: exam.slug
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'examen:', error);
        await createLog({ level: 'error', action: 'SYSTEM_ERROR', message: `Erreur lors de la suppression de l'examen: ${error.message}`, req, user: req.user });
        res.status(500).json({
            message: 'Erreur serveur lors de la suppression',
            error: error.message
        });
    }
}

// @desc    Ajouter un examen aux favoris
// @route   POST /api/exams/:slug/favorite
// @access  Private
const addToFavorites = async (req, res) => {
    try {
        const exam = await Exam.findOne({ slug: req.params.slug });
        if (!exam) {
            return res.status(404).json({ message: 'Examen non trouvé' });
        }

        const user = await User.findById(req.user._id);
        if (!user.favorites.includes(exam._id)) {
            user.favorites.push(exam._id);
            await user.save();

            // Créer une notification
            await Notification.create({
                recipient: user._id,
                type: 'success',
                title: 'Favori ajouté',
                message: `Vous avez ajouté "${exam.title}" à vos favoris`,
                metadata: {
                    examId: exam._id,
                    examTitle: exam.title,
                    examSlug: exam.slug
                },
                read: false
            });

            await createLog({ 
                level: 'info', 
                action: 'FAVORITE_ADDED', 
                message: `Examen ajouté aux favoris: ${exam.title}`, 
                req, 
                user: req.user, 
                metadata: { examId: exam._id, slug: exam.slug } 
            });
        }

        res.status(200).json({ message: 'Examen ajouté aux favoris' });
    } catch (error) {
        await createLog({ 
            level: 'error', 
            action: 'SYSTEM_ERROR', 
            message: `Erreur lors de l'ajout aux favoris: ${error.message}`, 
            req, 
            user: req.user 
        });
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Retirer un examen des favoris
// @route   DELETE /api/exams/:slug/favorite
// @access  Private
const removeFromFavorites = async (req, res) => {
    try {
        const exam = await Exam.findOne({ slug: req.params.slug });
        if (!exam) {
            return res.status(404).json({ message: 'Examen non trouvé' });
        }

        const user = await User.findById(req.user._id);
        user.favorites = user.favorites.filter(fav => !fav.equals(exam._id));
        await user.save();

        // Créer une notification
        await Notification.create({
            recipient: user._id,
            type: 'success',
            title: 'Favori retiré',
            message: `Vous avez retiré "${exam.title}" de vos favoris`,
            metadata: {
                examId: exam._id,
                examTitle: exam.title,
                examSlug: exam.slug
            },
            read: false
        });

        await createLog({ 
            level: 'info', 
            action: 'FAVORITE_REMOVED', 
            message: `Examen retiré des favoris: ${exam.title}`, 
            req, 
            user: req.user, 
            metadata: { examId: exam._id, slug: exam.slug } 
        });

        res.status(200).json({ message: 'Examen retiré des favoris' });
    } catch (error) {
        await createLog({ 
            level: 'error', 
            action: 'SYSTEM_ERROR', 
            message: `Erreur lors du retrait des favoris: ${error.message}`, 
            req, 
            user: req.user 
        });
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Récupérer les favoris de l'utilisateur
// @route   GET /api/exams/favorites
// @access  Private
const getFavorites = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const user = await User.findById(req.user._id).populate({
            path: 'favorites',
            options: { skip, limit, sort: { createdAt: -1 } }
        });

        const total = user.favorites.length;
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            exams: user.favorites,
            pagination: {
                currentPage: page,
                totalPages,
                total,
                limit
            }
        });
    } catch (error) {
        await createLog({ 
            level: 'error', 
            action: 'SYSTEM_ERROR', 
            message: `Erreur lors de la récupération des favoris: ${error.message}`, 
            req, 
            user: req.user 
        });
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Vérifier si un examen est dans les favoris
// @route   GET /api/exams/:slug/favorite/status
// @access  Private
const getFavoriteStatus = async (req, res) => {
    try {
        const exam = await Exam.findOne({ slug: req.params.slug });
        if (!exam) {
            return res.status(404).json({ message: 'Examen non trouvé' });
        }

        const user = await User.findById(req.user._id);
        const isFavorite = user.favorites.includes(exam._id);

        res.status(200).json({ isFavorite });
    } catch (error) {
        await createLog({ 
            level: 'error', 
            action: 'SYSTEM_ERROR', 
            message: `Erreur lors de la vérification du statut favori: ${error.message}`, 
            req, 
            user: req.user 
        });
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Incrémenter les vues d'un examen
// @route   POST /api/exams/:slug/view
// @access  Private
const incrementExamView = async (req, res) => {
    try {
        const exam = await Exam.findOne({ slug: req.params.slug });
        if (!exam) {
            return res.status(404).json({ message: 'Examen non trouvé' });
        }

        const userId = req.user._id;
        await exam.incrementView(userId);

        res.status(200).json({ message: 'Vue enregistrée', viewsCount: exam.viewsCount });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la vue:', error);
        // Silencieux en cas d'erreur pour ne pas bloquer l'expérience utilisateur
        res.status(200).json({ message: 'Vue enregistrée' });
    }
};

// @desc    Incrémenter les téléchargements d'un examen
// @route   POST /api/exams/:slug/download
// @access  Private
const incrementExamDownload = async (req, res) => {
    try {
        const exam = await Exam.findOne({ slug: req.params.slug });
        if (!exam) {
            return res.status(404).json({ message: 'Examen non trouvé' });
        }

        await exam.incrementDownload();

        res.status(200).json({ message: 'Téléchargement enregistré', downloadsCount: exam.downloadsCount });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du téléchargement:', error);
        // Silencieux en cas d'erreur pour ne pas bloquer l'expérience utilisateur
        res.status(200).json({ message: 'Téléchargement enregistré' });
    }
};


module.exports = {
    getAllExams,
    getExamBySlug,
    getUserExams,
    postExam,
    updateExam,
    deleteExam,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    getFavoriteStatus,
    incrementExamView,
    incrementExamDownload
};
