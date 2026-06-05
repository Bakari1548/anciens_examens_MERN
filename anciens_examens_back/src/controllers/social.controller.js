const Exam = require('../models/Exam');
const User = require('../models/User');
const { createLog } = require('../utils/logger');
const Notification = require('../models/Notification');

// @desc    Ajouter un like à un examen
// @route   POST /api/exams/:slug/like
// @access  Private
const likeExam = async (req, res) => {
    try {
        const exam = await Exam.findOne({ slug: req.params.slug });
        
        if (!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé'
            });
        }

        // Vérifier si l'utilisateur a déjà liké
        const alreadyLiked = exam.likes.some(like => like.user.toString() === req.user._id.toString());
        
        if (alreadyLiked) {
            return res.status(400).json({
                message: 'Vous avez déjà liké cet examen'
            });
        }

        // Ajouter le like
        await exam.addLike(req.user._id);
        
        await createLog({ level: 'info', action: 'EXAM_LIKED', message: `Like ajouté sur l'examen: ${exam.title}`, req, user: req.user, metadata: { examId: exam._id, slug: exam.slug } });
        res.status(200).json({
            message: 'Examen liké avec succès',
            likesCount: exam.likesCount,
            isLiked: true
        });
    } catch (error) {
        console.error('Erreur lors du like:', error);
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Retirer un like d'un examen
// @route   DELETE /api/exams/:slug/like
// @access  Private
const unlikeExam = async (req, res) => {
    try {
        const exam = await Exam.findOne({ slug: req.params.slug });
        
        if (!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé'
            });
        }

        // Retirer le like
        await exam.removeLike(req.user._id);
        
        await createLog({ level: 'info', action: 'EXAM_UNLIKED', message: `Like retiré de l'examen: ${exam.title}`, req, user: req.user, metadata: { examId: exam._id, slug: exam.slug } });
        res.status(200).json({
            message: 'Like retiré avec succès',
            likesCount: exam.likesCount,
            isLiked: false
        });
    } catch (error) {
        console.error('Erreur lors du unlike:', error);
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Ajouter un commentaire à un examen
// @route   POST /api/exams/:slug/comments
// @access  Private
const addComment = async (req, res) => {
    try {
        const exam = await Exam.findOne({ slug: req.params.slug });
        
        if (!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé'
            });
        }

        const { content } = req.body;
        
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                message: 'Le contenu du commentaire est requis'
            });
        }

        if (content.length > 500) {
            return res.status(400).json({
                message: 'Le commentaire ne peut pas dépasser 500 caractères'
            });
        }

        // Ajouter le commentaire avec les infos de l'utilisateur
        const comment = {
            user: req.user._id,
            content: content.trim(),
            createdAt: new Date()
        };
        
        exam.comments.push(comment);
        exam.commentsCount = exam.comments.length;
        await exam.save();

        // Envoyer une notification à l'auteur de l'examen si le commentaire n'est pas de lui-même
        if (exam.author._id.toString() !== req.user._id.toString()) {
            await Notification.create({
                recipient: exam.author._id,
                type: 'comment',
                title: 'Nouveau commentaire',
                message: `${req.user.firstName} ${req.user.lastName} a commenté sur votre examen "${exam.title}"`,
                metadata: {
                    examId: exam._id,
                    slug: exam.slug,
                    commentId: exam.comments[exam.comments.length - 1]._id
                },
                read: false
            });
        }

        // Récupérer le dernier commentaire ajouté
        const newComment = exam.comments[exam.comments.length - 1];
        
        // Peupler manuellement les informations de l'utilisateur
        const user = await User.findById(req.user._id).select('firstName lastName');
        const populatedComment = {
            _id: newComment._id,
            content: newComment.content,
            createdAt: newComment.createdAt,
            user: user ? {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName
            } : {
                _id: req.user._id,
                firstName: 'Utilisateur',
                lastName: 'inconnu'
            }
        };
        
        await createLog({ level: 'info', action: 'COMMENT_ADDED', message: `Nouveau commentaire sur l'examen: ${exam.title}`, req, user: req.user, metadata: { examId: exam._id, slug: exam.slug, commentId: newComment._id } });
        res.status(201).json({
            message: 'Commentaire ajouté avec succès',
            comment: populatedComment,
            commentsCount: exam.commentsCount
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Supprimer un commentaire d'un examen
// @route   DELETE /api/exams/:slug/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const exam = await Exam.findOne({ slug: req.params.slug });
        
        if (!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé'
            });
        }

        const commentId = req.params.commentId;
        const comment = exam.comments.id(commentId);
        
        if (!comment) {
            return res.status(404).json({
                message: 'Commentaire non trouvé'
            });
        }

        // Vérifier si l'utilisateur est l'auteur du commentaire ou l'auteur de l'examen
        const isCommentAuthor = comment.user.toString() === req.user._id.toString();
        const isExamAuthor = exam.author._id.toString() === req.user._id.toString();
        
        if (!isCommentAuthor && !isExamAuthor) {
            return res.status(403).json({
                message: 'Vous n\'avez pas la permission de supprimer ce commentaire'
            });
        }

        // Supprimer le commentaire
        await exam.removeComment(commentId);
        
        await createLog({ level: 'info', action: 'COMMENT_DELETED', message: `Commentaire supprimé sur l'examen: ${exam.title}`, req, user: req.user, metadata: { examId: exam._id, slug: exam.slug, commentId } });
        res.status(200).json({
            message: 'Commentaire supprimé avec succès',
            commentsCount: exam.commentsCount
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du commentaire:', error);
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Récupérer les commentaires d'un examen
// @route   GET /api/exams/:slug/comments
// @access  Public
const getComments = async (req, res) => {
    try {
        const exam = await Exam.findOne({ slug: req.params.slug });
        
        if (!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé'
            });
        }

        // Peupler manuellement les informations de l'utilisateur pour chaque commentaire
        const populatedComments = await Promise.all(
            exam.comments.map(async (comment) => {
                const user = await User.findById(comment.user).select('firstName lastName');
                return {
                    _id: comment._id,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    user: user ? {
                        _id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName
                    } : {
                        _id: comment.user,
                        firstName: 'Utilisateur',
                        lastName: 'supprimé'
                    }
                };
            })
        );

        res.status(200).json({
            message: 'Commentaires récupérés avec succès',
            comments: populatedComments,
            commentsCount: exam.commentsCount
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

// @desc    Vérifier si l'utilisateur a liké un examen
// @route   GET /api/exams/:slug/like/status
// @access  Private
const getLikeStatus = async (req, res) => {
    try {
        const exam = await Exam.findOne({ slug: req.params.slug });
        
        if (!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé'
            });
        }

        const isLiked = exam.isLikedBy(req.user._id);
        
        res.status(200).json({
            isLiked,
            likesCount: exam.likesCount
        });
    } catch (error) {
        console.error('Erreur lors de la vérification du like:', error);
        res.status(500).json({
            message: 'Erreur serveur',
            error: error.message
        });
    }
};

module.exports = {
    likeExam,
    unlikeExam,
    addComment,
    deleteComment,
    getComments,
    getLikeStatus
};
