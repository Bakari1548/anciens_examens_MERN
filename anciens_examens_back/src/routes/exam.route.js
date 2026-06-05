const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const { upload } = require('../config/cloudinary');
const {
    getAllExams,
    getExamBySlug,
    getUserExams,
    postExam,
    updateExam,
    deleteExam
} = require('../controllers/exam.controller');
const {
    likeExam,
    unlikeExam,
    addComment,
    deleteComment,
    getComments,
    getLikeStatus
} = require('../controllers/social.controller');
const {
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    getFavoriteStatus,
    incrementExamView,
    incrementExamDownload
} = require('../controllers/exam.controller');

// Wrapper qui capture proprement les erreurs Multer/Cloudinary
// (sinon elles "tuent" la connexion ce qui apparaît comme ERR_NETWORK côté client)
const uploadExamFiles = (req, res, next) => {
    console.log('[Upload start]', {
        method: req.method,
        url: req.originalUrl,
        contentType: req.headers['content-type'],
        contentLength: req.headers['content-length'],
        userAgent: req.headers['user-agent']
    });

    upload.array('files', 5)(req, res, (err) => {
        if (err) {
            console.error('[Upload error]', {
                name: err.name,
                code: err.code,
                message: err.message
            });
            // Erreur multer connue (taille, nb fichiers, type)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ message: 'Fichier trop volumineux (max 10MB)' });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({ message: 'Trop de fichiers (max 5)' });
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({ message: 'Champ de fichier inattendu' });
            }
            // Erreur fileFilter ou Cloudinary
            return res.status(400).json({
                message: err.message || "Erreur lors de l'upload du fichier",
                code: err.code || 'UPLOAD_ERROR'
            });
        }
        console.log('[Upload success]', {
            filesCount: req.files?.length || 0,
            files: (req.files || []).map(f => ({ name: f.originalname, type: f.mimetype, size: f.size }))
        });
        next();
    });
};

router.get('/', getAllExams);
router.get('/user', authMiddleware, getUserExams);
router.get('/favorites', authMiddleware, getFavorites);
router.get('/:slug', getExamBySlug);
router.post('/', authMiddleware, uploadExamFiles, postExam);
router.put('/:slug', authMiddleware, uploadExamFiles, updateExam);
router.delete('/:slug', authMiddleware, adminMiddleware, deleteExam);

// Routes pour les favoris
router.post('/:slug/favorite', authMiddleware, addToFavorites);
router.delete('/:slug/favorite', authMiddleware, removeFromFavorites);
router.get('/:slug/favorite/status', authMiddleware, getFavoriteStatus);

// Routes pour les likes
router.get('/:slug/like/status', authMiddleware, getLikeStatus);
router.post('/:slug/like', authMiddleware, likeExam);
router.delete('/:slug/like', authMiddleware, unlikeExam);

// Routes pour les commentaires
router.get('/:slug/comments', getComments);
router.post('/:slug/comments', authMiddleware, addComment);
router.delete('/:slug/comments/:commentId', authMiddleware, deleteComment);

// Routes pour le suivi des vues et téléchargements
router.post('/:slug/view', authMiddleware, incrementExamView);
router.post('/:slug/download', authMiddleware, incrementExamDownload);


module.exports = router;