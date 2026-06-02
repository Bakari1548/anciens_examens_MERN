const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { analyzeExamFile, checkDuplicate, chatWithExam, prepareChatCache } = require('../controllers/ai.controller');

// Multer en mémoire (le fichier n'est pas stocké, juste analysé par l'IA)
const memoryUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Type de fichier non supporté'), false);
    }
});

const handleUpload = (req, res) => {
    memoryUpload.single('file')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ message: 'Fichier trop volumineux (max 10MB)' });
            }
            return res.status(400).json({ message: err.message || 'Erreur upload' });
        }
    });
};

/**
 * @route POST /api/ai/analyze-exam
 * @desc Analyse un fichier d'examen → métadonnées + extraction d'exercices
 * @access Private
 */
router.post('/analyze-exam', authMiddleware, handleUpload, analyzeExamFile);

/**
 * @route POST /api/ai/check-duplicate
 * @desc Vérifie si un examen est un doublon (compare les exercices avec ceux des examens existants)
 * @access Private
 */
router.post('/check-duplicate', authMiddleware, checkDuplicate);

/**
 * @route POST /api/ai/prepare/:slug
 * @desc Prépare le cache Redis avec les métadonnées IA d'un examen
 * @access Private
 */
router.post('/prepare/:slug', authMiddleware, prepareChatCache);

/**
 * @route POST /api/ai/chat/:slug
 * @desc Chatbot tuteur pédagogique sur un examen donné
 * @access Private
 */
router.post('/chat/:slug', authMiddleware, chatWithExam);

module.exports = router;
